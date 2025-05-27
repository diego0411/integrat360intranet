const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const app = require("./app");
const { setupSocket } = require("./sockets/chat.socket");  // 💬 WebSocket Chat
const { setupSockets } = require("./sockets/socket.js");   // 🔔 WebSocket Notificaciones

dotenv.config();

// ✅ Verificación de variables de entorno
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY");
  process.exit(1);
}

// 🌐 Lista de orígenes permitidos
const allowedOrigins = [
  "https://integrat360-frontend.vercel.app",
  "https://tu-frontend-en-vercel.vercel.app",
  "https://main.dnwvajgvo8wr6.amplifyapp.com",
  "http://localhost:3000"
];

// ✅ Configuración de CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      console.warn(`⛔ CORS bloqueado para el origen: ${origin}`);
      callback(new Error("CORS bloqueado para este origen."));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight para todas las rutas

// 🛡️ Refuerzo manual de CORS (por compatibilidad)
app.use((req, res, next) => {
  const origin = req.headers.origin?.replace(/\/$/, "");
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// 🗂 Servir archivos estáticos (si aplica)
const uploadsPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Directorio 'uploads/' creado.");
}
app.use("/api/uploads", express.static(uploadsPath));

// 🔌 Crear servidor HTTP
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// 💬 Inicializar WebSockets
try {
  setupSocket(server);   // Chat
  setupSockets(server);  // Notificaciones
  console.log("✅ WebSockets inicializados correctamente.");
} catch (err) {
  console.error("❌ Error al inicializar sockets:", err.message);
}

// 🚀 Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`⚠️ El puerto ${PORT} ya está en uso.`);
    process.exit(1);
  } else {
    console.error("❌ Error en el servidor:", err);
  }
});
