const db = require('../config/db');

class Document {
    static async upload(name, folder_id, owner_id, url) {
        return db.execute(
            'INSERT INTO documents (name, folder_id, owner_id, url) VALUES (?, ?, ?, ?)',
            [name, folder_id, owner_id, url]
        );
    }

    static async getByFolder(folder_id) {
        return db.execute('SELECT * FROM documents WHERE folder_id = ?', [folder_id]);
    }

    static async delete(id) {
        return db.execute('DELETE FROM documents WHERE id = ?', [id]);
    }
}

module.exports = Document;
