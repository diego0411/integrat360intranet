const express = require("express");
const {
    getUserNotifications,
    markNotificationAsRead,
    sendPublicNotification
} = require("../controllers/notification.controller");

const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// ✅ Obtener notificaciones del usuario autenticado
router.get("/", verifyToken, getUserNotifications);

// ✅ Marcar una notificación como leída
router.put("/:id", verifyToken, markNotificationAsRead);

// ✅ Enviar una notificación pública (requiere autenticación si deseas limitar a admins)
router.post("/public", verifyToken, sendPublicNotification);

module.exports = router;
