const express = require("express");
const cors = require("cors"); 
const pool = require("./db");

const app = express();
const port = process.env.PORT || 4000

// Configuración de CORS para permitir solicitudes desde localhost:5173 (tu frontend Vue)
const corsOptions = {
  origin: "http://localhost:5173",  // Permite solicitudes desde el frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"] // Permite el encabezado Content-Type
};

// Usar CORS con las opciones especificadas
app.use(cors(corsOptions));

// Middleware para poder leer los datos en formato JSON de las solicitudes
app.use(express.json());

// Rutas
const usuariosRoutes = require("./routes/usuarios");
app.use("/api/usuarios", usuariosRoutes);

const emparejamientosRoutes = require("./routes/emparejamientos");
app.use("/api/emparejamientos", emparejamientosRoutes);

const reservasRoutes = require('./routes/reservas')
app.use('/api/reservas', reservasRoutes)


const jugadoresRoutes = require("./routes/jugadores");
app.use("/api/jugadores", jugadoresRoutes);


app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
});


