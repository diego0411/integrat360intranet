const app = require("./app");
const dotenv = require("dotenv");
const http = require("http");
const { setupSocket } = require("./sockets/chat.socket");
const path = require("path");
const express = require("express");
const fs = require("fs");

dotenv.config();
const cors = require("cors");

// 📌 Configuración CORS con detección automática de origen
const allowedOrigins = [
  "https://tu-frontend-en-vercel.vercel.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("⛔ CORS bloqueado para este origen"));
    }
  },
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Permitir preflight requests

// 📌 Middleware para manejar CORS en todas las respuestas
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// 📌 Configurar el puerto dinámico en Railway
const PORT = process.env.PORT || 5001;

// 📌 Crear servidor HTTP (Railway maneja HTTPS automáticamente)
const server = http.createServer(app);

// 📌 Configurar socket.io para el chat
setupSocket(server);

// 📂 Configuración de archivos estáticos (Asegura que `uploads/` exista)
const uploadsPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Directorio 'uploads/' creado.");
}

app.use("/api/uploads", express.static(uploadsPath));
console.log(`📂 Servidor de archivos estáticos activo en: ${uploadsPath}`);

// 📌 Manejo de errores al iniciar el servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
}).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`⚠️ Error: El puerto ${PORT} ya está en uso.`);
        process.exit(1);
    } else {
        console.error("❌ Error en el servidor:", err);
    }
});
