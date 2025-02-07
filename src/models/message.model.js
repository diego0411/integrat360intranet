const db = require('../config/db');

class Message {
    static async create(sender_id, receiver_id, content) {
        const [result] = await db.execute(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
            [sender_id, receiver_id, content]
        );

        return { id: result.insertId, sender_id, receiver_id, content, created_at: new Date() };
    }

    static async getChatHistory(user1, user2) {
        return db.execute(
            'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC',
            [user1, user2, user2, user1]
        );
    }
}

module.exports = Message;
