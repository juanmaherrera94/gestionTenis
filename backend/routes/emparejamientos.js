const express = require("express");
const router = express.Router();
const db = require("../db");

// Guardar disponibilidad y generar emparejamientos
router.post("/", (req, res) => {
  const { usuario_id, horario, dia } = req.body; 

  const insertQuery = `
    INSERT INTO disponibilidades (usuario_id, horario, dia)
    VALUES (?, ?, ?)
  `;

  db.query(insertQuery, [usuario_id, horario, dia], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error al guardar disponibilidad" });
    }

    const insertedId = result.insertId;

    const selectQuery = `SELECT * FROM disponibilidades WHERE id = ?`;
    db.query(selectQuery, [insertedId], (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(500).json({ error: "Error al recuperar la disponibilidad" });
      }

      res.json(rows[0]);
    });
  });
});

router.get("/", (req, res) => {
  const query = `
    SELECT d.*, u.nombre AS nombre_usuario
    FROM disponibilidades d
    JOIN usuarios u ON d.usuario_id = u.id
  `;

  db.query(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener disponibilidades" });
    }

    res.json(rows);
  });
});

router.get("/emparejamientos", (req, res) => {
  const query = `
    SELECT d.*, u.nombre AS nombre_usuario
    FROM disponibilidades d
    JOIN usuarios u ON d.usuario_id = u.id
  `;

  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ error: "Error cargando datos" });

    const agrupados = {};
    for (const r of rows) {
      const clave = `${r.dia}-${r.horario}`;
      if (!agrupados[clave]) agrupados[clave] = [];
      agrupados[clave].push(r);
    }

    const emparejamientos = [];
    let id = 1;

    for (const clave in agrupados) {
      const jugadores = agrupados[clave];
      for (let i = 0; i < jugadores.length - 1; i += 2) {
        emparejamientos.push({
          id: id++,
          jugador1: jugadores[i].nombre_usuario,
          jugador2: jugadores[i + 1].nombre_usuario,
          horario: jugadores[i].horario,
          dia: jugadores[i].dia,  // Asegúrate de incluir el 'dia' también
        });
      }
    }

    res.json(emparejamientos);
  });
});


module.exports = router;



  

