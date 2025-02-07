const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

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


const app = express();

app.use(cors());
app.use(bodyParser.json());

// 📂 Servir archivos estáticos desde la carpeta uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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


module.exports = app;
