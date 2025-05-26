const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = require("./app");
const { setupSocket } = require("./sockets/chat.socket");
const { setupSockets } = require("./sockets/socket.js");

dotenv.config();

// ✅ Validar variables de entorno necesarias
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY");
  process.exit(1);
}

// 🌐 Lista de orígenes permitidos
const allowedOrigins = [
  "https://integrat360-frontend.vercel.app",
  "https://integrat360-frontend-diegos-projects-dd0d649f.vercel.app",
  "https://main.dnwvajgvo8wr6.amplifyapp.com",
  "http://localhost:3000"
];

// 🌍 Detectar si estamos en desarrollo
const isDevelopment = process.env.NODE_ENV !== "production";

// ✅ Configuración CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (isDevelopment || !origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
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

// 🛡️ Aplicar CORS
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight

// 🔒 Middleware global opcional: reforzar headers manualmente
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isDevelopment || allowedOrigins.includes(origin?.replace(/\/$/, ""))) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// 📂 Servir archivos estáticos
const uploadsPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Carpeta 'uploads/' creada.");
}
app.use("/api/uploads", express.static(uploadsPath));

// 🔌 Crear servidor HTTP
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// 💬 Inicializar WebSockets
try {
  setupSocket(server);
  setupSockets(server);
  console.log("✅ WebSockets inicializados.");
} catch (error) {
  console.error("❌ Error al inicializar sockets:", error.message);
}

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
