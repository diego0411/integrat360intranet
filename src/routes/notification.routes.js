const express = require('express');
const {
    getUserNotifications,
    markNotificationAsRead,
    sendPublicNotification // ✅ Asegúrate de incluir esta función
} = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getUserNotifications);
router.put('/:id', verifyToken, markNotificationAsRead);

// 📌 Ruta corregida para enviar notificaciones públicas
router.post('/public', sendPublicNotification);

module.exports = router;
