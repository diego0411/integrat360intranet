const app = require('./app');
const dotenv = require('dotenv');
const http = require('http');  // Usar HTTP, Railway maneja HTTPS automáticamente
const { setupSocket } = require('./sockets/chat.socket');
const path = require('path');
const express = require('express');

dotenv.config();
const cors = require("cors");

// Configuración de CORS
const corsOptions = {
  origin: ["https://tu-frontend-en-vercel.vercel.app", "http://localhost:3000"], // Permite desarrollo y producción
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Permitir preflight requests

// 📌 Configurar el puerto dinámico
const PORT = process.env.PORT || 5001;

// 📌 Crear servidor HTTP (Railway ya maneja HTTPS)
const server = http.createServer(app);

// 📌 Configurar socket.io para el chat
setupSocket(server);

// 📌 Servir archivos estáticos
const uploadsPath = path.join(__dirname, "../uploads");
app.use("/api/uploads", express.static(uploadsPath));
console.log(`📂 Servidor de archivos estáticos en: ${uploadsPath}`);

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
