const app = require('./app');
const dotenv = require('dotenv');
const http = require('http');
const { setupSocket } = require('./sockets/chat.socket');
const path = require('path');
const express = require('express');

dotenv.config();
const cors = require("cors");

const corsOptions = {
  origin: ["https://integrat360-frontend.vercel.app"],
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));


// 📌 Configurar el puerto dinámico (Railway asigna uno diferente)
const PORT = process.env.PORT || 5001;

// 📌 Crear servidor HTTP
const server = http.createServer(app);

// 📌 Configurar socket.io para el chat
setupSocket(server);

// 📌 Servir archivos estáticos para descargas de documentos
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
