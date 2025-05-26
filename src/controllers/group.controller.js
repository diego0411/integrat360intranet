const Group = require("../models/group.model");
const supabase = require("../config/supabase");

// 📌 Obtener todos los grupos donde el usuario es creador o miembro
exports.getGroups = async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: "No autorizado. Token inválido." });
    }

    try {
        // Buscar grupos creados por el usuario o donde sea miembro
        const { data: groups, error } = await supabase
            .from("chat_groups")
            .select("id, name, created_by, group_members!inner(user_id)")
            .or(`created_by.eq.${userId},group_members.user_id.eq.${userId}`)
            .order("name", { ascending: true });

        if (error) throw error;

        const uniqueGroups = Array.from(new Map(groups.map(g => [g.id, g])).values());

        if (!uniqueGroups.length) {
            return res.status(200).json({ message: "No tienes grupos creados ni en los que seas miembro." });
        }

        res.json(uniqueGroups);
    } catch (error) {
        console.error("❌ Error al obtener grupos:", error.message);
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
        console.error("❌ Error al obtener miembros del grupo:", error.message);
        res.status(500).json({ error: "Error interno al obtener miembros del grupo." });
    }
};

// 📌 Crear un grupo
exports.createGroup = async (req, res) => {
    const { name } = req.body;
    const created_by = req.user.id;

    if (!name) {
        return res.status(400).json({ error: "El nombre del grupo es obligatorio." });
    }

    try {
        await Group.createGroup(name, created_by);
        res.status(201).json({ message: "✅ Grupo creado exitosamente." });
    } catch (error) {
        console.error("❌ Error al crear grupo:", error.message);
        res.status(500).json({ error: "Error interno al crear el grupo." });
    }
};

// 📌 Agregar usuario a un grupo
exports.addUserToGroup = async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    const adminId = req.user.id;

    if (!userId) {
        return res.status(400).json({ error: "El ID del usuario es obligatorio." });
    }

    try {
        // Verificar si el grupo existe y pertenece al admin
        const { data: group, error } = await supabase
            .from("chat_groups")
            .select("created_by")
            .eq("id", groupId)
            .single();

        if (error) throw error;
        if (!group) return res.status(404).json({ error: "El grupo no existe." });

        if (group.created_by !== adminId) {
            return res.status(403).json({ error: "No tienes permiso para agregar miembros a este grupo." });
        }

        // Verificar si el usuario ya es miembro
        const { data: existing, error: checkError } = await supabase
            .from("group_members")
            .select("*")
            .eq("group_id", groupId)
            .eq("user_id", userId);

        if (checkError) throw checkError;
        if (existing.length > 0) {
            return res.status(400).json({ error: "El usuario ya es miembro de este grupo." });
        }

        // Agregar al grupo
        const { error: insertError } = await supabase
            .from("group_members")
            .insert([{ group_id: groupId, user_id: userId }]);

        if (insertError) throw insertError;

        res.status(201).json({ message: "✅ Usuario agregado al grupo correctamente." });
    } catch (error) {
        console.error("❌ Error al agregar usuario al grupo:", error.message);
        res.status(500).json({ error: "Error interno al agregar usuario al grupo." });
    }
};

// 📌 Eliminar grupo (solo creador puede)
exports.deleteGroup = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    if (!groupId) {
        return res.status(400).json({ error: "ID de grupo inválido." });
    }

    try {
        const { data: group, error } = await supabase
            .from("chat_groups")
            .select("created_by")
            .eq("id", groupId)
            .single();

        if (error) throw error;
        if (!group) return res.status(404).json({ error: "El grupo no existe." });

        if (group.created_by !== userId) {
            return res.status(403).json({ error: "No tienes permiso para eliminar este grupo." });
        }

        // Eliminar miembros primero
        const { error: deleteMembersError } = await supabase
            .from("group_members")
            .delete()
            .eq("group_id", groupId);

        if (deleteMembersError) throw deleteMembersError;

        // Eliminar grupo
        const { error: deleteGroupError } = await supabase
            .from("chat_groups")
            .delete()
            .eq("id", groupId);

        if (deleteGroupError) throw deleteGroupError;

        res.json({ message: "✅ Grupo eliminado correctamente." });
    } catch (error) {
        console.error("❌ Error al eliminar grupo:", error.message);
        res.status(500).json({ error: "Error interno al eliminar el grupo." });
    }
};
