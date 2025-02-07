const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

// 📌 Validar que todas las variables de entorno estén definidas
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ ERROR: Falta la variable de entorno ${varName} en el archivo .env`);
    process.exit(1);
  }
});

// 📌 Crear pool de conexiones con mejor manejo de errores
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 📌 Manejo de errores en la conexión
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ ERROR AL CONECTAR A MYSQL:", err.code, err.message);
    process.exit(1);
  }
  console.log("✅ Conectado a MySQL correctamente.");
  connection.release(); // Liberar la conexión después de la prueba
});

module.exports = pool.promise();
