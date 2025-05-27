const express = require("express");
const {
    getUserNotifications,
    markNotificationAsRead,
    sendPublicNotification
} = require("../controllers/notification.controller");

const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// ✅ Obtener todas las notificaciones del usuario autenticado
router.get("/", verifyToken, getUserNotifications);

// ✅ Marcar una notificación como leída por ID
router.put("/:id/read", verifyToken, markNotificationAsRead);

// ✅ Enviar una notificación pública (puedes restringir a admins desde el middleware si es necesario)
router.post("/broadcast", verifyToken, sendPublicNotification);

module.exports = router;
