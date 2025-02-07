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
}

module.exports = Folder;
