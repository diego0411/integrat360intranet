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
        const created = await Notification.createNotification(userId, message, title);

        const io = getIO();
        io.to(`user-${userId}`).emit("receiveNotification", {
            id: created[0]?.id || null,
            title,
            message,
            read: false
        });

        console.log(`📢 Notificación enviada a usuario ${userId}: ${title}`);
    } catch (error) {
        console.error("❌ Error al crear notificación:", error.message);
    }
};

// 📌 Crear una notificación pública y emitir a todos
exports.sendPublicNotification = async (req, res) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({ error: "⚠️ Título y mensaje son requeridos." });
        }

        // Simula notificación pública creando múltiples entradas o usando broadcast
        const io = getIO();
        io.emit("receiveNotification", { title, message });

        console.log("📢 Notificación pública enviada:", { title, message });
        res.status(201).json({
            success: true,
            message: "Notificación enviada a todos los usuarios.",
            notification: { title, message }
        });
    } catch (error) {
        console.error("❌ Error al enviar notificación pública:", error.message);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};
