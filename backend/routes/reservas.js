const express = require("express");
const router = express.Router();
const db = require("../db");

// Crear una reserva o emparejamiento
router.post('/', async (req, res) => {
    const { dia, hora, usuario_id, numero_pista } = req.body;

    // Validación básica
    if (!dia || !hora || !usuario_id || numero_pista === undefined || numero_pista === null) {
        return res.status(400).json({ message: 'Faltan datos (día, hora, usuario_id o número de pista).' });
    }

    const pistaNum = parseInt(numero_pista);
    if (![1, 2, 3].includes(pistaNum)) {
        return res.status(400).json({ message: 'Número de pista inválido. Debe ser 1, 2 o 3.' });
    }

    const currentUserId = parseInt(usuario_id);

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Verifica si ya hay emparejamiento para ese día, hora y pista
        const [existingPairings] = await connection.query(
            'SELECT id FROM emparejamientos WHERE dia = ? AND horario = ? AND pista = ?',
            [dia, hora, pistaNum]
        );

        if (existingPairings.length > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({ message: 'Este slot ya tiene un emparejamiento confirmado.' });
        }

        // Busca si hay otro jugador esperando en ese horario y pista
        const [potentialOpponents] = await connection.query(
            'SELECT id, usuario_id FROM reservas WHERE dia = ? AND hora = ? AND numero_pista = ? AND usuario_id != ?',
            [dia, hora, pistaNum, currentUserId]
        );

        if (potentialOpponents.length > 0) {
            const opponent = potentialOpponents[0];
            const opponentId = opponent.usuario_id;

            // Obtiene la división de ambos jugadores
            const [opponentDetailsQuery] = await connection.query(
                'SELECT division_id, nombre FROM usuarios WHERE id = ?', [opponentId]
            );
            const [currentUserDetailsQuery] = await connection.query(
                'SELECT division_id, nombre FROM usuarios WHERE id = ?', [currentUserId]
            );

            if (opponentDetailsQuery.length === 0 || currentUserDetailsQuery.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({ message: 'No se encontraron detalles de uno de los usuarios.' });
            }

            const opponentDivisionId = opponentDetailsQuery[0].division_id;
            const currentUserDivisionId = currentUserDetailsQuery[0].division_id;

            // Si ambos tienen división y son diferentes, no se emparejan
            if (opponentDivisionId !== null && currentUserDivisionId !== null && opponentDivisionId !== currentUserDivisionId) {
                // Comprueba si ya existe la reserva para no duplicar
                const [currentUserReservations] = await connection.query(
                    'SELECT id FROM reservas WHERE dia = ? AND hora = ? AND numero_pista = ? AND usuario_id = ?',
                    [dia, hora, pistaNum, currentUserId]
                );

                if (currentUserReservations.length > 0) {
                    await connection.commit();
                    connection.release();
                    return res.status(200).json({ message: 'El oponente es de una división diferente.' });
                }

                // Guarda la disponibilidad del jugador actual
                await connection.query(
                    'INSERT INTO reservas (dia, hora, usuario_id, numero_pista) VALUES (?, ?, ?, ?)',
                    [dia, hora, currentUserId, pistaNum]
                );
                await connection.commit();
                connection.release();
                return res.status(201).json({ message: 'Disponibilidad guardada. El oponente es de otra división.' });
            }

            // Define la división para el emparejamiento
            let divisionIdParaEmparejamiento = opponentDivisionId || currentUserDivisionId;

            // Crea el emparejamiento
            await connection.query(
                'INSERT INTO emparejamientos (usuario1_id, usuario2_id, horario, division_id, dia, pista) VALUES (?, ?, ?, ?, ?, ?)',
                [opponentId, currentUserId, hora, divisionIdParaEmparejamiento, dia, pistaNum]
            );

            // Elimina la reserva previa del oponente
            await connection.query(
                'DELETE FROM reservas WHERE id = ?',
                [opponent.id]
            );

            await connection.commit();
            connection.release();
            return res.status(201).json({ message: '¡Emparejamiento creado con éxito!' });

        } else {
            // Si no hay oponente, guarda la disponibilidad del jugador
            const [currentUserReservations] = await connection.query(
                'SELECT id FROM reservas WHERE dia = ? AND hora = ? AND numero_pista = ? AND usuario_id = ?',
                [dia, hora, pistaNum, currentUserId]
            );

            if (currentUserReservations.length > 0) {
                await connection.rollback();
                connection.release();
                return res.status(409).json({ message: 'Ya has registrado esta disponibilidad.' });
            }

            await connection.query(
                'INSERT INTO reservas (dia, hora, usuario_id, numero_pista) VALUES (?, ?, ?, ?)',
                [dia, hora, currentUserId, pistaNum]
            );

            await connection.commit();
            connection.release();
            return res.status(201).json({ message: 'Disponibilidad guardada. Esperando oponente.' });
        }

    } catch (error) {
        console.error('Error en la transacción:', error);
        if (connection) {
            try { await connection.rollback(); } catch (e) { console.error('Error al hacer rollback:', e); }
            try { connection.release(); } catch (e) { console.error('Error al liberar conexión:', e); }
        }
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Obtener reservas pendientes (sin emparejar)
router.get('/pendientes', async (req, res) => {
    try {
        const query = `
            SELECT r.id, r.dia, r.hora, r.numero_pista, r.usuario_id, u.nombre AS nombre_jugador
            FROM reservas r
            JOIN usuarios u ON r.usuario_id = u.id 
            ORDER BY r.dia, r.hora, r.numero_pista;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener reservas pendientes:", err);
        res.status(500).json({ error: "Error al obtener reservas pendientes" });
    }
});

// Obtener emparejamientos confirmados
router.get('/emparejamientos-confirmados', async (req, res) => {
    try {
        const query = `
            SELECT e.id, e.dia, e.horario, e.pista, e.division_id, 
                   u1.nombre AS nombre_jugador1, u2.nombre AS nombre_jugador2,
                   d.nombre AS nombre_division 
            FROM emparejamientos e
            JOIN usuarios u1 ON e.usuario1_id = u1.id
            JOIN usuarios u2 ON e.usuario2_id = u2.id
            LEFT JOIN divisiones d ON e.division_id = d.id 
            ORDER BY e.dia, e.horario, e.pista;
        `;
        const [emparejamientos] = await db.query(query);
        res.json(emparejamientos);
    } catch (error) {
        console.error('Error al obtener emparejamientos confirmados:', error);
        res.status(500).json({ message: 'Error interno al obtener emparejamientos confirmados.' });
    }
});

// Obtener todas las reservas actuales (solo las pendientes)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT r.id, r.dia, r.hora, r.numero_pista,
                   u.nombre AS nombre_jugador, r.usuario_id
            FROM reservas r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.dia, r.hora, r.numero_pista;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener todas las reservas:", err);
        res.status(500).json({ error: "Error al obtener todas las reservas" });
    }
});

module.exports = router;
