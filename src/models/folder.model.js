const db = require('../config/db');

class Folder {
    static async create(name, owner_id) {
        return db.execute('INSERT INTO folders (name, owner_id) VALUES (?, ?)', [name, owner_id]);
    }

    static async getByOwner(owner_id) {
        return db.execute('SELECT * FROM folders WHERE owner_id = ?', [owner_id]);
    }

    static async delete(id) {
        return db.execute('DELETE FROM folders WHERE id = ?', [id]);
    }

    // 📌 Compartir carpeta con usuario
    static async shareWithUser(folderId, userId) {
        return db.execute('INSERT INTO folder_shares (folder_id, user_id) VALUES (?, ?)', [folderId, userId]);
    }

    // 📌 Compartir carpeta con grupo
    static async shareWithGroup(folderId, groupId) {
        return db.execute('INSERT INTO folder_shares (folder_id, group_id) VALUES (?, ?)', [folderId, groupId]);
    }

    // 📌 Obtener carpetas compartidas con un grupo
    static async getSharedWithGroups(userId) {
        return db.execute(`
            SELECT f.id, f.name FROM folders f
            JOIN folder_shares fs ON f.id = fs.folder_id
            JOIN group_members gm ON gm.group_id = fs.group_id
            WHERE gm.user_id = ?
        `, [userId]);
    }
}

module.exports = Folder;
