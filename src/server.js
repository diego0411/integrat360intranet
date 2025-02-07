const app = require('./app');
const dotenv = require('dotenv');
const http = require('http');
const { setupSocket } = require('./sockets/chat.socket');
const path = require('path');
const express = require('express');

dotenv.config();

const PORT = process.env.PORT || 5001;
const server = http.createServer(app); // 📌 Crear servidor HTTP

setupSocket(server); // 📌 Configurar socket.io para el chat

// 📌 Servir archivos estáticos para descargas de documentos
const uploadsPath = path.join(__dirname, "../uploads"); // 📌 Asegura que la ruta sea correcta
app.use("/api/uploads", express.static(uploadsPath));

console.log(`📂 Servidor de archivos estáticos en: ${uploadsPath}`);

server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
