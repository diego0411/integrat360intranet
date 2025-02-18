const db = require('../config/db');

class Chat {
    // 📌 Guardar mensaje en la base de datos
    static async saveMessage(sender_id, receiver_id, group_id, message) {
        return db.execute(
            'INSERT INTO messages (sender_id, receiver_id, group_id, message) VALUES (?, ?, ?, ?)',
            [sender_id, receiver_id || null, group_id || null, message]
        );
    }
    static async createPublicMessage(senderId, message) {
        return db.execute(
            "INSERT INTO messages (sender_id, message, created_at) VALUES (?, ?, NOW())",
            [senderId, message]
        );
    }
    

    // 📌 Obtener mensajes públicos
    static async getPublicMessages() {
        return db.execute(
            'SELECT messages.id, users.name AS sender_name, messages.message, messages.created_at ' +
        'FROM messages ' +
        'JOIN users ON messages.sender_id = users.id ' +
        'WHERE messages.receiver_id IS NULL AND messages.group_id IS NULL ' +
        'ORDER BY messages.created_at DESC'
        );
    }

    // 📌 Obtener mensajes privados entre dos usuarios
    static async getPrivateMessages(sender_id, receiver_id) {
        return db.execute(
            'SELECT messages.id, users.name AS sender_name, messages.message, messages.created_at FROM messages JOIN users ON messages.sender_id = users.id WHERE (messages.sender_id = ? AND messages.receiver_id = ?) OR (messages.sender_id = ? AND messages.receiver_id = ?) ORDER BY messages.created_at DESC',
            [sender_id, receiver_id, receiver_id, sender_id]
        );
    }

    // 📌 Obtener mensajes de grupo
    static async getGroupMessages(group_id) {
        return db.execute(
            'SELECT messages.id, users.name AS sender_name, messages.message, messages.created_at FROM messages JOIN users ON messages.sender_id = users.id WHERE messages.group_id = ? ORDER BY messages.created_at DESC',
            [group_id]
        );
    }
     // 📌 Guardar mensaje en la base de datos
     static async saveMessage(sender_id, receiver_id, group_id, message) {
        return db.execute(
            'INSERT INTO messages (sender_id, receiver_id, group_id, message) VALUES (?, ?, ?, ?)',
            [sender_id, receiver_id || null, group_id || null, message]
        );
    }

    static async createPrivateMessage(sender_id, receiver_id, message) {
        return db.execute(
            'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
            [sender_id, receiver_id, message]
        );
    
}
}

   


module.exports = Chat;
