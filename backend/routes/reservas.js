// backend/routes/reservas.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // Tu módulo de conexión a la BD (ej. mysql2/promise pool)

// POST /api/reservas - Para crear una reserva o un emparejamiento
router.post('/', async (req, res) => {
    const { dia, hora, usuario_id, numero_pista } = req.body;

    // Validación básica de datos
    if (!dia || !hora || !usuario_id || numero_pista === undefined || numero_pista === null) {
        return res.status(400).json({ message: 'Faltan datos (día, hora, usuario_id o número de pista).' });
    }

    const pistaNum = parseInt(numero_pista);
    // Ajusta el array de pistas válidas si tienes más o menos, o diferentes números
    if (![1, 2, 3].includes(pistaNum)) {
        return res.status(400).json({ message: 'Número de pista inválido. Debe ser 1, 2 o 3.' });
    }
    const currentUserId = parseInt(usuario_id);

    let connection;
    try {
        connection = await db.getConnection(); // Obtener conexión del pool
        await connection.beginTransaction();   // Iniciar transacción

        // 1. Verificar si ya existe un emparejamiento confirmado para este slot
        const [existingPairings] = await connection.query(
            'SELECT id FROM emparejamientos WHERE dia = ? AND horario = ? AND pista = ?',
            [dia, hora, pistaNum]
        );

        if (existingPairings.length > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({ message: 'Este slot ya tiene un emparejamiento confirmado.' });
        }

        // 2. Buscar un oponente potencial en la tabla `reservas`
        const [potentialOpponents] = await connection.query(
            'SELECT id, usuario_id FROM reservas WHERE dia = ? AND hora = ? AND numero_pista = ? AND usuario_id != ?',
            [dia, hora, pistaNum, currentUserId]
        );

        if (potentialOpponents.length > 0) {
            const opponent = potentialOpponents[0];
            const opponentId = opponent.usuario_id;

            // Obtener detalles de AMBOS jugadores para comparar divisiones
            const [opponentDetailsQuery] = await connection.query(
                'SELECT division_id, nombre FROM usuarios WHERE id = ?', // nombre para mensajes de error
                [opponentId]
            );
            const [currentUserDetailsQuery] = await connection.query(
                'SELECT division_id, nombre FROM usuarios WHERE id = ?',
                [currentUserId]
            );

            if (opponentDetailsQuery.length === 0 || currentUserDetailsQuery.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({ message: 'No se encontraron detalles de uno de los usuarios.' });
            }

            const opponentDivisionId = opponentDetailsQuery[0].division_id;
            const currentUserDivisionId = currentUserDetailsQuery[0].division_id;

            // --- AQUÍ LA NUEVA COMPROBACIÓN ---
            if (opponentDivisionId === null || currentUserDivisionId === null) {
                // Opción 1: Permitir si uno o ambos no tienen división asignada (y usar una para el emparejamiento)
                // O Opción 2: Requerir que ambos tengan división y sean iguales
                // Este ejemplo sigue con la lógica anterior de tomar la primera disponible si una es null,
                // pero si quieres que sea estricto, aquí pondrías un error.
                // Si quieres que el emparejamiento no se produzca si las divisiones no son iguales Y no nulas:
                // (ver siguiente bloque if)
                // console.log(`Uno o ambos jugadores no tienen división asignada. Oponente: ${opponentDivisionId}, Actual: ${currentUserDivisionId}`);
                // Podrías decidir no crear el emparejamiento aquí si es un requisito estricto
            }
            
            // --- MODIFICACIÓN/ADICIÓN IMPORTANTE: Comprobar si las divisiones son diferentes y NO nulas ---
            if (opponentDivisionId !== null && currentUserDivisionId !== null && opponentDivisionId !== currentUserDivisionId) {
                await connection.rollback();
                connection.release();
                // En lugar de crear el emparejamiento, el usuario actual se añade a reservas como pendiente.
                // O puedes devolver un mensaje específico
                // return res.status(409).json({ message: `No se puede emparejar. El oponente ${opponentDetailsQuery[0].nombre} es de una división diferente.` });
                
                // Si quieres que en este caso el jugador actual quede en espera (como si no hubiera oponente):
                // Verificar que el usuario actual no tenga ya una reserva idéntica
                const [currentUserReservations] = await connection.query(
                    'SELECT id FROM reservas WHERE dia = ? AND hora = ? AND numero_pista = ? AND usuario_id = ?',
                    [dia, hora, pistaNum, currentUserId]
                );

                if (currentUserReservations.length > 0) {
                    // Ya tenía una reserva, no hacemos nada más, o actualizamos timestamp si quisieras
                    await connection.commit(); // O rollback si no quieres cambiar nada
                    connection.release();
                    return res.status(200).json({ message: 'El oponente encontrado es de una división diferente.' });
                }

                // Insertar la nueva reserva para el jugador actual
                await connection.query(
                    'INSERT INTO reservas (dia, hora, usuario_id, numero_pista) VALUES (?, ?, ?, ?)',
                    [dia, hora, currentUserId, pistaNum]
                );
                await connection.commit();
                connection.release();
                return res.status(201).json({ message: 'Disponibilidad guardada. El oponente encontrado es de una división diferente.' });

            }
            // --- FIN DE LA MODIFICACIÓN ---


            // Si pasan la comprobación (o si decides permitir divisiones diferentes/nulas)
            // se procede a asignar la division_id para el emparejamiento.
            // La lógica actual toma la del oponente si existe, si no la del actual.
            let divisionIdParaEmparejamiento = null;
            if (opponentDivisionId !== null) {
                divisionIdParaEmparejamiento = opponentDivisionId;
            } else if (currentUserDivisionId !== null) {
                divisionIdParaEmparejamiento = currentUserDivisionId;
            }
            // Si ambas son null, divisionIdParaEmparejamiento seguirá siendo null.

            // Insertar en la tabla `emparejamientos`
            await connection.query(
                'INSERT INTO emparejamientos (usuario1_id, usuario2_id, horario, division_id, dia, pista) VALUES (?, ?, ?, ?, ?, ?)',
                [opponentId, currentUserId, hora, divisionIdParaEmparejamiento, dia, pistaNum]
            );

            // Eliminar la reserva del oponente de la tabla `reservas`
            await connection.query(
                'DELETE FROM reservas WHERE id = ?',
                [opponent.id]
            );

            await connection.commit();
            connection.release();
            return res.status(201).json({ message: '¡Emparejamiento creado con éxito!' });

        } else {
            // No se encontró oponente: Guardar disponibilidad del usuario actual
            // Verificar que el usuario actual no tenga ya una reserva idéntica
            const [currentUserReservations] = await connection.query(
                'SELECT id FROM reservas WHERE dia = ? AND hora = ? AND numero_pista = ? AND usuario_id = ?',
                [dia, hora, pistaNum, currentUserId]
            );

            if (currentUserReservations.length > 0) {
                await connection.rollback(); // Deshacer transacción
                connection.release();        // Liberar conexión
                return res.status(409).json({ message: 'Ya has registrado esta disponibilidad.' });
            }

            // Insertar la nueva reserva
            await connection.query(
                'INSERT INTO reservas (dia, hora, usuario_id, numero_pista) VALUES (?, ?, ?, ?)',
                [dia, hora, currentUserId, pistaNum]
            );

            await connection.commit(); // Confirmar transacción
            connection.release();      // Liberar conexión
            return res.status(201).json({ message: 'Disponibilidad guardada. Esperando oponente.' });
        }

    } catch (error) {
        console.error('Error en la transacción de reserva/emparejamiento:', error);
        if (connection) {
            try {
                await connection.rollback(); // Asegurarse de deshacer en caso de error
            } catch (rollbackError) {
                console.error('Error al hacer rollback:', rollbackError);
            }
            try {
                connection.release();        // Y liberar la conexión
            } catch (releaseError) {
                console.error('Error al liberar conexión:', releaseError);
            }
        }
        return res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud.' });
    }
});

// GET /api/reservas/pendientes - Para obtener reservas que aún no son emparejamientos
router.get('/pendientes', async (req, res) => {
    // Esta ruta asume que las reservas que se convierten en emparejamientos se eliminan
    // de la tabla 'reservas', como se hace en el endpoint POST anterior.
    try {
        const query = `
            SELECT 
                r.id, 
                r.dia, 
                r.hora,
                r.numero_pista,
                r.usuario_id, 
                u.nombre AS nombre_jugador
            FROM reservas r
            JOIN usuarios u ON r.usuario_id = u.id 
            ORDER BY r.dia, r.hora, r.numero_pista;
        `;
        const [rows] = await db.query(query); // Asume que db.query es compatible con promesas
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener reservas pendientes (backend):", err);
        res.status(500).json({ error: "Error al obtener reservas pendientes" });
    }
});

// GET /api/reservas/emparejamientos-confirmados - Para obtener los emparejamientos ya hechos
router.get('/emparejamientos-confirmados', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.id, 
                e.dia, 
                e.horario, 
                e.pista, 
                e.division_id, 
                u1.nombre AS nombre_jugador1, 
                u2.nombre AS nombre_jugador2,
                d.nombre AS nombre_division 
            FROM emparejamientos e
            JOIN usuarios u1 ON e.usuario1_id = u1.id
            JOIN usuarios u2 ON e.usuario2_id = u2.id
            LEFT JOIN divisiones d ON e.division_id = d.id 
            ORDER BY e.dia, e.horario, e.pista;
        `;
        const [emparejamientos] = await db.query(query); // Asume que db.query es compatible con promesas
        res.json(emparejamientos);
    } catch (error) {
        console.error('Error al obtener emparejamientos confirmados:', error);
        res.status(500).json({ message: 'Error interno al obtener emparejamientos confirmados.' });
    }
});

// Esta ruta GET /api/reservas (raíz) es la que tu frontend usaba originalmente
// para la tabla superior de "Reservas".
// Decide qué quieres que muestre. Podría ser lo mismo que /pendientes,
// o una lista de *todos* los tipos de reservas/emparejamientos donde participa el usuario,
// o simplemente las pendientes. Por ahora, la dejo como la tenías en tu último código,
// que obtiene todas las entradas de la tabla 'reservas' con el nombre del jugador.
// Si las reservas se eliminan al crear emparejamientos, esta también mostrará solo las pendientes.
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                r.id, 
                r.dia, 
                r.hora,
                r.numero_pista,
                u.nombre AS nombre_jugador,
                r.usuario_id
            FROM reservas r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.dia, r.hora, r.numero_pista;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener todas las reservas (raíz):", err);
        res.status(500).json({ error: "Error al obtener todas las reservas" });
    }
});

module.exports = router;