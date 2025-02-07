const Notification = require('../models/notification.model');

exports.getUserNotifications = async (req, res) => {
    const user_id = req.user.id;

    try {
        const [notifications] = await Notification.getUserNotifications(user_id);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    const { id } = req.params;

    try {
        await Notification.markAsRead(id);
        res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
