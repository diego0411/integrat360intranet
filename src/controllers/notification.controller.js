const Notification = require('../models/notification.model');
const { getIO } = require('../sockets/socket'); // ✅ Corregido para obtener `getIO()`

// 📌 Obtener las notificaciones de un usuario
exports.getUserNotifications = async (req, res) => {
    const user_id = req.user.id;

    try {
        const notifications = await Notification.getUserNotifications(user_id);
        res.json(notifications);
    } catch (error) {
        console.error("❌ Error al obtener notificaciones:", error);
        res.status(500).json({ error: "Error interno al obtener notificaciones." });
    }
};

// 📌 Marcar una notificación como leída
exports.markNotificationAsRead = async (req, res) => {
    const { id } = req.params;

    try {
        await Notification.markAsRead(id);
        res.json({ message: '✅ Notificación marcada como leída' });
    } catch (error) {
        console.error("❌ Error al marcar la notificación como leída:", error);
        res.status(500).json({ error: "Error interno al marcar la notificación." });
    }
};

// 📌 Crear una notificación para un usuario específico
exports.createNotification = async (userId, title, message) => {
    try {
        const notificationId = await Notification.create(userId, title, message);
        
        // 🔔 Emitir notificación en tiempo real con Socket.io
        const io = getIO();
        io.to(`user-${userId}`).emit("receiveNotification", {
            id: notificationId,
            title,
            message,
            read: false
        });

        console.log(`📢 Notificación enviada a usuario ${userId}: ${title}`);
    } catch (error) {
        console.error("❌ Error al crear notificación:", error);
    }
};

// 📌 Enviar una notificación pública a todos los usuarios
exports.sendPublicNotification = async (req, res) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({ error: "Título y mensaje son requeridos." });
        }

        // 📌 Guardar notificación en la base de datos para todos los usuarios
        const newNotification = await Notification.createPublicNotification(title, message);

        // 📌 Emitir notificación a todos los usuarios conectados
        const io = getIO();
        io.emit("receiveNotification", { title, message });

        console.log("📢 Notificación pública enviada a todos los usuarios:", { title, message });

        res.status(201).json({ success: true, message: "Notificación enviada a todos los usuarios.", notification: newNotification });
    } catch (error) {
        console.error("❌ Error al enviar notificación pública:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};
