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

// 🌐 Permitir cualquier origen (no recomendado en producción sensible)
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // ❗ Importante: si usas cookies, cambia esto a `true` y configura `origin` correctamente
};

// ✅ Aplicar CORS globalmente
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// 🔌 Middleware de seguridad extra (opcional pero redundante aquí)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Permitir todos los orígenes
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
