const db = require("../config/db");

// 📌 Crear una nueva carpeta
const createFolder = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) return res.status(400).json({ error: "⚠️ El nombre de la carpeta es obligatorio" });

        const [result] = await db.execute("INSERT INTO folders (name, owner_id) VALUES (?, ?)", [name, userId]);

        res.status(201).json({ message: "✅ Carpeta creada correctamente", folderId: result.insertId });
    } catch (error) {
        console.error("❌ Error al crear carpeta:", error);
        res.status(500).json({ error: "Error interno al crear la carpeta" });
    }
};

// 📌 Obtener todas las carpetas del usuario (propias, compartidas con usuarios y grupos)
const listFolders = async (req, res) => {
    try {
        const userId = req.user.id;

        const [ownFolders] = await db.execute("SELECT id, name FROM folders WHERE owner_id = ?", [userId]);
        const [sharedFolders] = await db.execute(`
            SELECT f.id, f.name FROM folders f
            JOIN folder_shares fs ON f.id = fs.folder_id
            WHERE fs.user_id = ?
        `, [userId]);
        const [sharedGroupFolders] = await db.execute(`
            SELECT f.id, f.name FROM folders f
            JOIN folder_shares fs ON f.id = fs.folder_id
            JOIN group_members gm ON fs.group_id = gm.group_id
            WHERE gm.user_id = ?
        `, [userId]);

        res.json({
            ownFolders: ownFolders || [],
            sharedFolders: sharedFolders || [],
            sharedGroupFolders: sharedGroupFolders || []
        });
    } catch (error) {
        console.error("❌ Error al obtener carpetas:", error);
        res.status(500).json({ error: "Error interno al obtener las carpetas" });
    }
};

// 📌 Compartir carpeta con usuario
const shareFolder = async (req, res) => {
    try {
        const { folderId, userId } = req.body;
        const ownerId = req.user.id;

        const [folders] = await db.execute("SELECT * FROM folders WHERE id = ? AND owner_id = ?", [folderId, ownerId]);
        if (folders.length === 0) return res.status(403).json({ error: "⛔ No tienes permiso para compartir esta carpeta" });

        await db.execute("INSERT INTO folder_shares (folder_id, user_id) VALUES (?, ?)", [folderId, userId]);

        res.json({ message: "✅ Carpeta compartida exitosamente con el usuario" });
    } catch (error) {
        console.error("❌ Error al compartir la carpeta con usuario:", error);
        res.status(500).json({ error: "Error interno al compartir la carpeta con usuario" });
    }
};

// 📌 Compartir carpeta con grupo
const shareFolderWithGroup = async (req, res) => {
    try {
        const { folderId, groupId } = req.body;
        const ownerId = req.user.id;

        const [folders] = await db.execute("SELECT * FROM folders WHERE id = ? AND owner_id = ?", [folderId, ownerId]);
        if (folders.length === 0) return res.status(403).json({ error: "⛔ No tienes permiso para compartir esta carpeta" });

        await db.execute("INSERT INTO folder_shares (folder_id, group_id) VALUES (?, ?)", [folderId, groupId]);

        res.json({ message: "✅ Carpeta compartida con el grupo exitosamente" });
    } catch (error) {
        console.error("❌ Error al compartir la carpeta con grupo:", error);
        res.status(500).json({ error: "Error interno al compartir la carpeta con grupo" });
    }
};

// 📌 Eliminar una carpeta y sus documentos
const deleteFolder = async (req, res) => {
    try {
        const folderId = req.params.id;
        const userId = req.user.id;

        const [folders] = await db.execute("SELECT * FROM folders WHERE id = ? AND owner_id = ?", [folderId, userId]);
        if (folders.length === 0) return res.status(404).json({ error: "⛔ La carpeta no existe o no tienes permiso para eliminarla" });

        await db.execute("DELETE FROM folder_shares WHERE folder_id = ?", [folderId]);
        await db.execute("DELETE FROM documents WHERE folder_id = ?", [folderId]);
        await db.execute("DELETE FROM folders WHERE id = ?", [folderId]);

        res.json({ message: "✅ Carpeta eliminada correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar carpeta:", error);
        res.status(500).json({ error: "Error interno al eliminar la carpeta" });
    }
};
// 📌 Obtener contenido de una carpeta: subcarpetas y documentos
const getFolderContents = async (req, res) => {
    try {
        const { folder_id } = req.params;

        // 🔹 Obtener subcarpetas
        const [subfolders] = await db.execute(
            "SELECT id, name FROM folders WHERE parent_id = ?",
            [folder_id]
        );

        // 🔹 Obtener documentos
        const [documents] = await db.execute(
            "SELECT id, name, url FROM documents WHERE folder_id = ?",
            [folder_id]
        );

        res.json({ subfolders, documents });
    } catch (error) {
        console.error("❌ Error al obtener contenido de la carpeta:", error);
        res.status(500).json({ error: "Error interno al obtener los contenidos." });
    }
};

// 📌 Exportar la función
module.exports = {
    createFolder,
    listFolders,
    shareFolder,
    shareFolderWithGroup,
    deleteFolder,
    getFolderContents, // 👈 Agregar esta línea
};



