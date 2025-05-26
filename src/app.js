const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

// 🔁 Rutas importadas
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const folderRoutes = require("./routes/folder.routes");
const documentRoutes = require("./routes/document.routes");
const eventRoutes = require("./routes/event.routes");
const chatRoutes = require("./routes/chat.routes");
const notificationRoutes = require("./routes/notification.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const groupRoutes = require("./routes/group.routes");
const birthdayRoutes = require("./routes/birthday.routes");

// ⚙️ Inicialización de la app
const app = express();

// 🌐 CORS
const allowedOrigins = [
  "https://tu-frontend-en-vercel.vercel.app",
  "https://main.dnwvajgvo8wr6.amplifyapp.com",
  "https://integrat360-frontend.vercel.app";
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
app.use(bodyParser.json());

// 🗂 Archivos estáticos
const uploadsPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Directorio 'uploads/' creado automáticamente.");
}

app.use("/uploads", express.static(uploadsPath));

// 🔌 Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/birthdays", birthdayRoutes);

// ⚠️ Middleware global de errores
app.use((err, req, res, next) => {
  console.error("❌ Error en middleware global:", err.message);
  res.status(err.status || 500).json({
    error: "❌ Error interno del servidor",
    message: err.message || "Algo salió mal",
  });
});

module.exports = app;
