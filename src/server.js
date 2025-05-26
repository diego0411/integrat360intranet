const app = require("./app");
const dotenv = require("dotenv");
const http = require("http");
const { setupSocket } = require("./sockets/chat.socket");
const { setupSockets } = require("./sockets/socket.js");
const path = require("path");
const express = require("express");
const fs = require("fs");
const cors = require("cors");

dotenv.config();

// ✅ Verificación básica de Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY");
  process.exit(1);
}

// 🌐 CORS
const allowedOrigins = [
  "https://tu-frontend-en-vercel.vercel.app",
  "https://main.dnwvajgvo8wr6.amplifyapp.com",
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
  allowedHeaders: ["Content-Type", Authorization],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Middleware adicional para CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// 🔌 Inicializar servidor HTTP
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// 💬 Sockets
try {
  setupSocket(server);  // Chat
  setupSockets(server); // Notificaciones
  console.log("✅ Sockets inicializados correctamente.");
} catch (error) {
  console.error("❌ Error al inicializar los sockets:", error);
}

// 🗂 Servir archivos estáticos (si los necesitas)
const uploadsPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Directorio 'uploads/' creado.");
}
app.use("/api/uploads", express.static(uploadsPath));

// 🚀 Arrancar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`⚠️ Puerto ${PORT} en uso.`);
    process.exit(1);
  } else {
    console.error("❌ Error en el servidor:", err);
  }
});
