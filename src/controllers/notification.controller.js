const Notification = require("../models/notification.model");
const { getIO } = require("../sockets/socket");

// 📌 Obtener las notificaciones de un usuario
exports.getUserNotifications = async (req, res) => {
    const user_id = req.user.id;

    try {
        const notifications = await Notification.getUserNotifications(user_id);
        res.json(notifications);
    } catch (error) {
        console.error("❌ Error al obtener notificaciones:", error.message);
        res.status(500).json({ error: "Error interno al obtener notificaciones." });
    }
};

// 📌 Marcar una notificación como leída
exports.markNotificationAsRead = async (req, res) => {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F\-]{36}$/)) {
        return res.status(400).json({ error: "⛔ ID de notificación inválido." });
    }

    try {
        await Notification.markAsRead(id);
        res.json({ message: "✅ Notificación marcada como leída" });
    } catch (error) {
        console.error("❌ Error al marcar la notificación:", error.message);
        res.status(500).json({ error: "Error interno al marcar la notificación." });
    }
};

// 📌 Crear una notificación privada y emitir en tiempo real
exports.createNotification = async (userId, title, message) => {
    try {
        const notification = await Notification.createNotification(userId, title, message);

        const io = getIO();
        io.to(`user-${userId}`).emit("receiveNotification", {
            id: notification.id,
            title,
            message,
            read: false,
            created_at: notification.created_at
        });

        console.log(`📢 Notificación enviada a usuario ${userId}: ${title}`);
    } catch (error) {
        console.error("❌ Error al crear notificación:", error.message);
    }
};

// 📌 Crear una notificación pública y emitir a todos los usuarios conectados
exports.sendPublicNotification = async (req, res) => {
    const { title, message } = req.body;

    if (!title || !message) {
        return res.status(400).json({ error: "⚠️ Título y mensaje son requeridos." });
    }

    try {
        const io = getIO();
        io.emit("receiveNotification", {
            title,
            message,
            read: false,
            public: true
        });

        console.log("📢 Notificación pública enviada:", { title, message });
        res.status(201).json({
            success: true,
            message: "Notificación pública enviada a todos los usuarios.",
            notification: { title, message }
        });
    } catch (error) {
        console.error("❌ Error al enviar notificación pública:", error.message);
        res.status(500).json({ error: "Error interno al enviar notificación pública." });
    }
};
