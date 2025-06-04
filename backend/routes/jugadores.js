const express = require("express");
const router = express.Router();
const db = require("../db"); // conexión promisificada (mysql2/promise)



// Obtener todos los jugadores
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM usuarios");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un jugador por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);

    if (result.length === 0) return res.status(404).json({ error: "Jugador no encontrado" });

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo jugador

router.post("/", async (req, res) => {
  try {
    const { nombre, usuario, password, division_id, rol } = req.body;

   if (!nombre || !usuario || !password || typeof division_id !== 'number' || !rol) {

      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const [result] = await db.query(
      "INSERT INTO usuarios (nombre, usuario, password, division_id, rol) VALUES (?, ?, ?, ?, ?)",
      [nombre, usuario, password, division_id, rol]
    );

    res.json({ message: "Jugador creado con éxito", id: result.insertId });
  } catch (err) {
    console.error(err); // 👈 Muy útil para ver errores en consola
    res.status(500).json({ error: err.message });
  }
});


router.post('/registro', async (req, res) => {
  try {
    const { nombre, usuario, password, division, rol } = req.body;

    if (!nombre || !usuario || !password || !division || !rol) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const [existingUser] = await db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }


const [result] = await db.query(
  'INSERT INTO usuarios (nombre, usuario, password, division_id, rol) VALUES (?, ?, ?, ?, ?)',
  [nombre, usuario, password, division, rol]
);

    res.json({ message: 'Usuario registrado con éxito', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Actualizar datos de un jugador
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, usuario, division_id } = req.body;

    await db.query(
      "UPDATE usuarios SET nombre = ?, usuario = ?, division_id = ? WHERE id = ?",
      [nombre, usuario, division_id, id]
    );

    res.json({ message: "Jugador actualizado con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un jugador
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM usuarios WHERE id = ?", [id]);
    res.json({ message: "Jugador eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
