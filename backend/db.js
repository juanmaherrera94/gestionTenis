const mysql = require("mysql2/promise");

let pool;

if (process.env.DATABASE_URL) {
  // Producción en Railway (usa la URL completa)
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  // Desarrollo local (usa host, usuario, etc.)
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

module.exports = pool;
