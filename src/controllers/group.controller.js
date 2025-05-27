const supabase = require("../config/supabase");

// 📌 Obtener todos los grupos donde el usuario es creador o miembro
exports.getGroups = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: "No autorizado. Token inválido." });
    }

    try {
        // Consulta grupos donde el usuario es creador o miembro
        const { data, error } = await supabase
            .rpc("get_user_groups", { user_id_param: userId }); // ✅ Idealmente usar función SQL en Supabase

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error("❌ Error al obtener grupos:", error.message);
        res.status(500).json({ error: "Error interno al obtener grupos." });
    }
};

// 📌 Obtener miembros de un grupo
exports.getGroupMembers = async (req, res) => {
    const { groupId } = req.params;

    try {
        const { data, error } = await supabase
            .from("group_members")
            .select("user_id, users(id, name, email)")
            .eq("group_id", groupId);

        if (error) throw error;

        const members = data.map(member => ({
            id: member.user_id,
            name: member.users?.name || "Sin nombre",
            email: member.users?.email || "Sin email"
        }));

        res.json(members);
    } catch (error) {
        console.error("❌ Error al obtener miembros del grupo:", error.message);
        res.status(500).json({ error: "Error interno al obtener miembros del grupo." });
    }
};

// 📌 Crear un grupo
exports.createGroup = async (req, res) => {
    const { name } = req.body;
    const created_by = req.user?.id;

    if (!name || !created_by) {
        return res.status(400).json({ error: "El nombre del grupo es obligatorio." });
    }

    try {
        const { data, error } = await supabase
            .from("chat_groups")
            .insert([{ name, created_by }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: "✅ Grupo creado exitosamente.", group: data });
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
        // Verificar que el grupo exista y pertenezca al solicitante
        const { data: group, error: groupError } = await supabase
            .from("chat_groups")
            .select("created_by")
            .eq("id", groupId)
            .single();

        if (groupError || !group) {
            throw new Error("El grupo no existe o no se pudo verificar.");
        }

        if (group.created_by !== adminId) {
            return res.status(403).json({ error: "No tienes permiso para agregar miembros a este grupo." });
        }

        // Verificar si ya es miembro
        const { data: exists, error: existsError } = await supabase
            .from("group_members")
            .select("id")
            .eq("group_id", groupId)
            .eq("user_id", userId);

        if (existsError) throw existsError;
        if (exists.length > 0) {
            return res.status(400).json({ error: "El usuario ya pertenece al grupo." });
        }

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

// 📌 Eliminar grupo (solo el creador puede)
exports.deleteGroup = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    try {
        const { data: group, error } = await supabase
            .from("chat_groups")
            .select("created_by")
            .eq("id", groupId)
            .single();

        if (error || !group) {
            throw new Error("El grupo no existe o no se pudo verificar.");
        }

        if (group.created_by !== userId) {
            return res.status(403).json({ error: "No tienes permiso para eliminar este grupo." });
        }

        // Eliminar miembros
        await supabase.from("group_members").delete().eq("group_id", groupId);

        // Eliminar grupo
        const { error: deleteError } = await supabase
            .from("chat_groups")
            .delete()
            .eq("id", groupId);

        if (deleteError) throw deleteError;

        res.json({ message: "✅ Grupo eliminado correctamente." });
    } catch (error) {
        console.error("❌ Error al eliminar grupo:", error.message);
        res.status(500).json({ error: "Error interno al eliminar el grupo." });
    }
};
