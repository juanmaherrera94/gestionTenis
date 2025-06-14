const mysql = require("mysql2/promise");

let pool;

/* if (process.env.DATABASE_URL) {/* 
   // Parsear la URL usando la clase URL para extraer los datos
  /* const { URL } = require("url");
  const dbUrl = new URL(process.env.DATABASE_URL);

  pool = mysql.createPool({
    host: dbUrl.hostname,
    port: dbUrl.port,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }) 
 } else { 
  // Configuración para desarrollo local
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "gestion_tenis",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
/* } */

module.exports = pool;
