const db = require("../config/db");

// 📌 Crear una nueva carpeta (permite subcarpetas y área)
const createFolder = async (req, res) => {
    try {
        const { name, parent_id, area } = req.body;
        const userId = req.user.id;

        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "⚠️ El nombre de la carpeta es obligatorio" });
        }

        // 📌 Verificar si `parent_id` es válido (si se proporciona)
        if (parent_id) {
            const [parentFolder] = await db.execute("SELECT id FROM folders WHERE id = ?", [parent_id]);
            if (parentFolder.length === 0) {
                return res.status(400).json({ error: "⛔ La carpeta padre no existe" });
            }
        }

        // 📌 Insertar carpeta con `parent_id` y `area`
        const [result] = await db.execute(
            "INSERT INTO folders (name, owner_id, parent_id, area) VALUES (?, ?, ?, ?)",
            [name.trim(), userId, parent_id || null, area || null]
        );

        res.status(201).json({ message: "✅ Carpeta creada correctamente", folderId: result.insertId });
    } catch (error) {
        console.error("❌ Error al crear carpeta:", error);
        res.status(500).json({ error: "Error interno al crear la carpeta" });
    }
};

// 📌 Obtener todas las carpetas principales del usuario (propias y compartidas)
const listFolders = async (req, res) => {
    try {
        const userId = req.user.id;

        // 📌 Obtener solo carpetas principales del usuario
        const [ownFolders] = await db.execute(
            "SELECT id, name, area FROM folders WHERE owner_id = ? AND parent_id IS NULL",
            [userId]
        );

        // 📌 Obtener carpetas principales compartidas con el usuario
        const [sharedFolders] = await db.execute(`
            SELECT f.id, f.name, f.area FROM folders f
            JOIN folder_shares fs ON f.id = fs.folder_id
            WHERE fs.user_id = ? AND f.parent_id IS NULL
        `, [userId]);

        res.json({
            ownFolders: ownFolders || [],
            sharedFolders: sharedFolders || [],
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

        const [folders] = await db.execute("SELECT id FROM folders WHERE id = ? AND owner_id = ?", [folderId, ownerId]);
        if (folders.length === 0) {
            return res.status(403).json({ error: "⛔ No tienes permiso para compartir esta carpeta" });
        }

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

        const [folders] = await db.execute("SELECT id FROM folders WHERE id = ? AND owner_id = ?", [folderId, ownerId]);
        if (folders.length === 0) {
            return res.status(403).json({ error: "⛔ No tienes permiso para compartir esta carpeta" });
        }

        await db.execute("INSERT INTO folder_shares (folder_id, group_id) VALUES (?, ?)", [folderId, groupId]);

        res.json({ message: "✅ Carpeta compartida con el grupo exitosamente" });
    } catch (error) {
        console.error("❌ Error al compartir la carpeta con grupo:", error);
        res.status(500).json({ error: "Error interno al compartir la carpeta con grupo" });
    }
};

// 📌 Eliminar una carpeta y sus documentos (incluyendo subcarpetas)
const deleteFolder = async (req, res) => {
    try {
        const folderId = req.params.id;
        const userId = req.user.id;

        // 📌 Verificar si la carpeta existe y pertenece al usuario
        const [folders] = await db.execute("SELECT id FROM folders WHERE id = ? AND owner_id = ?", [folderId, userId]);
        if (folders.length === 0) {
            return res.status(404).json({ error: "⛔ La carpeta no existe o no tienes permiso para eliminarla" });
        }

        // 📌 Eliminar subcarpetas y documentos antes de eliminar la carpeta principal
        await db.execute("DELETE FROM documents WHERE folder_id IN (SELECT id FROM folders WHERE parent_id = ?)", [folderId]);
        await db.execute("DELETE FROM folders WHERE parent_id = ?", [folderId]);

        // 📌 Eliminar la carpeta
        await db.execute("DELETE FROM folder_shares WHERE folder_id = ?", [folderId]);
        await db.execute("DELETE FROM documents WHERE folder_id = ?", [folderId]);
        await db.execute("DELETE FROM folders WHERE id = ?", [folderId]);

        res.json({ message: "✅ Carpeta eliminada correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar carpeta:", error);
        res.status(500).json({ error: "Error interno al eliminar la carpeta" });
    }
};

// 📌 Obtener contenido de una carpeta (subcarpetas y documentos)
const getFolderContents = async (req, res) => {
    try {
        const folderId = parseInt(req.params.folder_id, 10);
        if (isNaN(folderId)) {
            return res.status(400).json({ error: "⛔ ID de carpeta inválido" });
        }

        // 📌 Obtener subcarpetas
        const [subfolders] = await db.execute(
            "SELECT id, name FROM folders WHERE parent_id = ?",
            [folderId]
        );

        // 📌 Obtener documentos
        const [documents] = await db.execute(
            "SELECT id, name, url FROM documents WHERE folder_id = ?",
            [folderId]
        );

        res.json({ subfolders, documents });
    } catch (error) {
        console.error("❌ Error al obtener contenido de la carpeta:", error);
        res.status(500).json({ error: "Error interno al obtener los contenidos." });
    }
};

// 📌 Obtener carpetas del área "proyectos"
const listProjectFolders = async (req, res) => {
    try {
        const [projectFolders] = await db.execute(
            "SELECT id, name FROM folders WHERE area = 'proyectos' AND parent_id IS NULL"
        );

        res.json({ projectFolders: projectFolders || [] });
    } catch (error) {
        console.error("❌ Error al obtener carpetas de proyectos:", error);
        res.status(500).json({ error: "Error interno al obtener carpetas de proyectos." });
    }
};
// 📌 Mover una subcarpeta a otra carpeta principal
const moveFolder = async (req, res) => {
    try {
        // 📌 Corregir nombres de variables recibidas
        const { folder_id, new_parent_id } = req.body;
        const userId = req.user.id;

        if (!folder_id || !new_parent_id) {
            return res.status(400).json({ error: "⚠️ Se requieren folder_id y new_parent_id" });
        }

        // 📌 Verificar si la carpeta a mover existe y pertenece al usuario
        const [folder] = await db.execute("SELECT id FROM folders WHERE id = ? AND owner_id = ?", [folder_id, userId]);
        if (!folder.length) {
            return res.status(403).json({ error: "⛔ No tienes permiso para mover esta carpeta" });
        }

        // 📌 Verificar si la nueva carpeta padre existe
        const [newParent] = await db.execute("SELECT id FROM folders WHERE id = ?", [new_parent_id]);
        if (!newParent.length) {
            return res.status(400).json({ error: "⛔ La carpeta destino no existe" });
        }

        // 📌 Evitar mover una carpeta dentro de sí misma
        if (parseInt(folder_id) === parseInt(new_parent_id)) {
            return res.status(400).json({ error: "⛔ No puedes mover una carpeta dentro de sí misma" });
        }

        // 📌 Actualizar `parent_id` de la subcarpeta
        await db.execute("UPDATE folders SET parent_id = ? WHERE id = ?", [new_parent_id, folder_id]);

        res.json({ message: "✅ Carpeta movida correctamente" });
    } catch (error) {
        console.error("❌ Error al mover la carpeta:", error);
        res.status(500).json({ error: "Error interno al mover la carpeta" });
    }
};




// 📌 Exportar funciones
module.exports = {
    createFolder,
    listFolders,
    listProjectFolders,
    shareFolder,
    shareFolderWithGroup,
    deleteFolder,
    getFolderContents,
    moveFolder
};
