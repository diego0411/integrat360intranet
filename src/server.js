const app = require("./app");
const dotenv = require("dotenv");
const http = require("http");
const { setupSocket } = require("./sockets/chat.socket");  // 🔵 Chat
const { setupSockets } = require("./sockets/socket.js");   // 🔔 Notificaciones
const path = require("path");
const express = require("express");
const fs = require("fs");
const cors = require("cors");

dotenv.config();

// ✅ Verificación de variables de entorno Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY");
  process.exit(1);
}

// 🌐 Lista de orígenes permitidos
const allowedOrigins = [
  "https://integrat360-frontend.vercel.app",
  "https://tu-frontend-en-vercel.vercel.app",
  "https://main.dnwvajgvo8wr6.amplifyapp.com",
  "http://localhost:3000",
];

// ✅ Configuración robusta de CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      console.warn(`⛔ CORS bloqueado para el origen: ${origin}`);
      callback(new Error("⛔ CORS bloqueado para este origen"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// ✅ Aplicar CORS correctamente
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight

// 🛡️ Middleware global para reforzar headers de CORS (por si acaso)
app.use((req, res, next) => {
  const origin = req.headers.origin?.replace(/\/$/, "");
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// 🔌 Crear servidor HTTP
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// 💬 WebSockets (chat + notificaciones)
try {
  setupSocket(server);
  setupSockets(server);
  console.log("✅ Sockets inicializados correctamente.");
} catch (error) {
  console.error("❌ Error al inicializar los sockets:", error.message);
}

// 🗂 Servir archivos estáticos
const uploadsPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Directorio 'uploads/' creado.");
}
app.use("/api/uploads", express.static(uploadsPath));

// 🚀 Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`⚠️ El puerto ${PORT} ya está en uso.`);
    process.exit(1);
  } else {
    console.error("❌ Error en el servidor:", err);
  }
});
