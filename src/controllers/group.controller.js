const Group = require("../models/group.model");
const db = require("../config/db"); // 📌 Asegúrate de importar la conexión a la BD

// 📌 Obtener todos los grupos
exports.getGroups = async (req, res) => {
    const userId = req.user?.id;
    console.log("👤 Usuario autenticado:", req.user); // 📌 Depuración

    if (!userId) {
        return res.status(401).json({ error: "No autorizado. Token inválido." });
    }

    try {
        const [groups] = await db.execute(
            `
            SELECT DISTINCT cg.id, cg.name, cg.created_by
            FROM chat_groups cg
            LEFT JOIN group_members gm ON cg.id = gm.group_id
            WHERE cg.created_by = ? OR gm.user_id = ?
            ORDER BY cg.name ASC
            `,
            [userId, userId]
        );

        if (!groups.length) {
            return res.status(200).json({ message: "No tienes grupos creados ni en los que seas miembro." });
        }

        res.json(groups);
    } catch (error) {
        console.error("❌ Error al obtener grupos:", error);
        res.status(500).json({ error: "Error interno al obtener grupos." });
    }
};

// 📌 Obtener miembros de un grupo
exports.getGroupMembers = async (req, res) => {
    const { groupId } = req.params;

    try {
        const members = await Group.getGroupMembers(groupId);
        res.json(members);
    } catch (error) {
        console.error("❌ Error al obtener miembros del grupo:", error);
        res.status(500).json({ error: "Error interno al obtener miembros del grupo." });
    }
};

// 📌 Crear un grupo
exports.createGroup = async (req, res) => {
    const { name } = req.body;
    const created_by = req.user.id; // ✅ Captura el usuario autenticado

    if (!name) {
        return res.status(400).json({ error: "El nombre del grupo es obligatorio." });
    }

    try {
        await Group.createGroup(name, created_by);
        res.status(201).json({ message: "✅ Grupo creado exitosamente." });
    } catch (error) {
        console.error("❌ Error al crear grupo:", error);
        res.status(500).json({ error: "Error interno al crear el grupo." });
    }
};

// 📌 Agregar usuario a un grupo
exports.addUserToGroup = async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    const adminId = req.user.id; // Usuario autenticado

    if (!userId) {
        return res.status(400).json({ error: "El ID del usuario es obligatorio." });
    }

    try {
        // 📌 Verificar si el grupo existe y quién es su creador
        const [group] = await db.execute("SELECT created_by FROM chat_groups WHERE id = ?", [groupId]);

        if (!group.length) {
            return res.status(404).json({ error: "El grupo no existe." });
        }

        if (group[0].created_by !== adminId) {
            return res.status(403).json({ error: "No tienes permiso para agregar miembros a este grupo." });
        }

        // 📌 Verificar si el usuario ya es miembro del grupo
        const [isMember] = await db.execute(
            "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
            [groupId, userId]
        );

        if (isMember.length > 0) {
            return res.status(400).json({ error: "El usuario ya es miembro de este grupo." });
        }

        // 📌 Agregar usuario al grupo
        await db.execute("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", [groupId, userId]);

        res.status(201).json({ message: "✅ Usuario agregado al grupo correctamente." });
    } catch (error) {
        console.error("❌ Error al agregar usuario al grupo:", error);
        res.status(500).json({ error: "Error interno al agregar usuario al grupo." });
    }
};

// 📌 Eliminar un grupo (Solo el creador puede hacerlo)
exports.deleteGroup = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id; // 📌 Usuario autenticado

    // 📌 Validación adicional para `groupId`
    if (!groupId || isNaN(groupId)) {
        return res.status(400).json({ error: "ID de grupo inválido." });
    }

    try {
        // 📌 Verificar si el usuario autenticado es el creador del grupo
        const [group] = await db.execute(
            "SELECT created_by FROM chat_groups WHERE id = ?",
            [groupId]
        );

        if (group.length === 0) {
            return res.status(404).json({ error: "El grupo no existe." });
        }

        if (group[0].created_by !== userId) {
            return res.status(403).json({ error: "No tienes permiso para eliminar este grupo." });
        }

        // 📌 Eliminar los miembros del grupo antes de eliminar el grupo
        await db.execute("DELETE FROM group_members WHERE group_id = ?", [groupId]);

        // 📌 Eliminar el grupo
        await db.execute("DELETE FROM chat_groups WHERE id = ?", [groupId]);

        res.json({ message: "✅ Grupo eliminado correctamente." });
    } catch (error) {
        console.error("❌ Error al eliminar grupo:", error);
        res.status(500).json({ error: "Error interno al eliminar el grupo." });
    }
};
