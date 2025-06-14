const express = require("express");
const router = express.Router();
const db = require("../db"); // Este ya es con mysql2/promise

router.post("/login", async (req, res) => {
  const { usuario, password } = req.body;
  console.log("Datos recibidos:", usuario, password);

  const query = `
    SELECT u.id, u.nombre, u.rol, u.division_id, d.nombre as nombre_division
    FROM usuarios u
    LEFT JOIN divisiones d ON u.division_id = d.id
    WHERE u.usuario = ? AND u.password = ?
  `;

  try {
    const [results] = await db.query(query, [usuario, password]);
    console.log(results);
    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const user = results[0];
    res.json({ user: { id: user.id, nombre: user.nombre, rol: user.rol } });

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});
//cambiar  de contraseña
router.put('/:id/contrasena', async (req, res) => {
  const { id } = req.params;
  const { actual, nueva } = req.body;

  if (!actual || !nueva) {
    return res.status(400).json({ message: "Faltan campos." });
  }

  try {
    const [usuarios] = await db.query('SELECT password FROM usuarios WHERE id = ?', [id]);
    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuario = usuarios[0];
    if (usuario.password !== actual) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [nueva, id]);
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    res.status(500).json({ message: "Error al actualizar la contraseña" });
  }
});

module.exports = router;
