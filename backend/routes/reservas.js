// backend/routes/reservas.js

const express = require("express");
const router = express.Router();
const db = require("../db");


router.post('/', async (req, res) => {
  const { dia, hora, usuario_id, numero_pista } = req.body;

  console.log('Datos recibidos:', req.body); // <-- importante para depurar

  if (!dia || !hora || !usuario_id || !numero_pista) { 
    return res.status(400).json({ message: 'Faltan datos (día, hora, usuario_id o número de pista)' });
  }

  const pistaNum = parseInt(numero_pista);
  if (![1, 2, 3].includes(pistaNum)) {
    return res.status(400).json({ message: 'Número de pista inválido. Debe ser 1, 2 o 3.' });
  }

  try {
    const [existingReservations] = await db.query(
      'SELECT id FROM reservas WHERE dia = ? AND hora = ? AND numero_pista = ?', 
      [dia, hora, pistaNum]
    );

    if (existingReservations.length > 0) {
      return res.status(409).json({ message: 'Este horario y pista ya están reservados.' });
    }

    // CORREGIDO: insertar con valores
    await db.query(
      'INSERT INTO reservas (dia, hora, usuario_id, numero_pista) VALUES (?, ?, ?, ?)',
      [dia, hora, usuario_id, pistaNum]
    );

    res.status(201).json({ message: 'Reserva guardada con éxito' });
  } catch (error) {
    console.error('Error al guardar la reserva:', error.message);
    res.status(500).json({ message: 'Error interno al guardar la reserva' });
  }
});



// Obtener todas las reservas
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT 
        reservas.id, 
        reservas.dia, 
        reservas.hora,
        reservas.numero_pista,       -- <--- CAMBIADO a numero_pista
        usuarios.nombre AS nombre_jugador
      FROM reservas
      LEFT JOIN usuarios ON reservas.usuario_id = usuarios.id
    `; 
    const [rows] = await db.query(query);
    // console.log("Reservas enviadas al frontend:", JSON.stringify(rows, null, 2));
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener reservas (backend):", err);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
});
module.exports = router;