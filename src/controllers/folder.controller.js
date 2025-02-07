const db = require("../config/db");

// 📌 Crear una nueva carpeta
exports.createFolder = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) return res.status(400).json({ error: "El nombre de la carpeta es obligatorio" });

        const [result] = await db.execute("INSERT INTO folders (name, owner_id) VALUES (?, ?)", [name, userId]);

        res.status(201).json({ message: "Carpeta creada correctamente", folderId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear la carpeta" });
    }
};

// 📌 Obtener todas las carpetas del usuario (propias y compartidas)
exports.listFolders = async (req, res) => {
    try {
        const userId = req.user.id;
        const [ownFolders] = await db.execute("SELECT id, name FROM folders WHERE owner_id = ?", [userId]);

        const [sharedFolders] = await db.execute(`
            SELECT f.id, f.name FROM folders f
            JOIN folder_shares fs ON f.id = fs.folder_id
            WHERE fs.user_id = ?
        `, [userId]);

        res.json({ ownFolders, sharedFolders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las carpetas" });
    }
};

// 📌 Compartir una carpeta con otro usuario
exports.shareFolder = async (req, res) => {
    try {
        const { folderId, userId } = req.body;
        const ownerId = req.user.id;

        const [folders] = await db.execute("SELECT * FROM folders WHERE id = ? AND owner_id = ?", [folderId, ownerId]);
        if (folders.length === 0) return res.status(403).json({ error: "No tienes permiso para compartir esta carpeta" });

        await db.execute("INSERT INTO folder_shares (folder_id, user_id) VALUES (?, ?)", [folderId, userId]);

        res.json({ message: "Carpeta compartida exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al compartir la carpeta" });
    }
};

// 📌 Obtener la lista de usuarios registrados
exports.listUsers = async (req, res) => {
    try {
        const [users] = await db.execute("SELECT id, name, email FROM users WHERE id != ?", [req.user.id]);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener la lista de usuarios" });
    }
};

// 📌 Eliminar una carpeta y sus documentos
exports.deleteFolder = async (req, res) => {
    try {
        const folderId = req.params.id;
        const userId = req.user.id;

        const [folders] = await db.execute("SELECT * FROM folders WHERE id = ? AND owner_id = ?", [folderId, userId]);
        if (folders.length === 0) return res.status(403).json({ error: "No tienes permiso para eliminar esta carpeta" });

        await db.execute("DELETE FROM folder_shares WHERE folder_id = ?", [folderId]);
        await db.execute("DELETE FROM documents WHERE folder_id = ?", [folderId]);
        await db.execute("DELETE FROM folders WHERE id = ?", [folderId]);

        res.json({ message: "Carpeta eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar la carpeta" });
    }
};
