const db = require('../config/db');

class Notification {
    static async create(user_id, message, type) {
        const [result] = await db.execute(
            'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
            [user_id, message, type]
        );

        return { id: result.insertId, user_id, message, type, is_read: false, created_at: new Date() };
    }

    static async getUserNotifications(user_id) {
        return db.execute('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
    }

    static async markAsRead(id) {
        return db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    }
    
    static async createPublicNotification(message, type) {
        const [result] = await db.execute(
            'INSERT INTO notifications (user_id, message, type) SELECT id, ?, ? FROM users',
            [message, type]
        );
    
        return result;
    }
    
}

module.exports = Notification;
