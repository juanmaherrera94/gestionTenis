require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const cron = require('node-cron');
const path = require("path");

const app = express();
const port = process.env.PORT || 4000;

// Configuración de CORS para permitir solicitudes desde localhost:5173 (tu frontend Vue)
const corsOptions = {
  origin: ["http://localhost:5173", "https://gestiontenis.onrender.com", `http://localhost:${port}`],
  methods: "*",               // Permite todos los métodos
  allowedHeaders: "*",       // Permite todos los headers
  credentials: true          // Si necesitas cookies o headers de autenticación
};

// Usar CORS con las opciones especificadas
app.use(cors(corsOptions));

// Middleware para poder leer los datos en formato JSON de las solicitudes
app.use(express.json());

// Tarea programada para limpiar la tabla de emparejamientos cada lunes a la 1:00 AM                //Libreria cron utilizada
cron.schedule('0 1 * * 1', async () => {
    console.log(`Ejecutando tarea de limpieza de emparejamientos...`);
    try {
        await pool.query("DELETE FROM emparejamientos");
        console.log(`Limpieza de emparejamientos completada.`);
    } catch (error) {
        console.error("Error durante la tarea de limpieza de emparejamientos:", error);
    }
});

// Servir los archivos estáticos de la aplicación Vue desde la carpeta 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas
const usuariosRoutes = require("./routes/usuarios");
app.use("/api/usuarios", usuariosRoutes);

const reservasRoutes = require('./routes/reservas');
app.use('/api/reservas', reservasRoutes);

const jugadoresRoutes = require("./routes/jugadores");
app.use("/api/jugadores", jugadoresRoutes);

// Ruta "catch-all" para reenviar todas las demás solicitudes al index.html de Vue
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
});