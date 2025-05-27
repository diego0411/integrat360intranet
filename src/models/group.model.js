const supabase = require("../config/supabase");

class Group {
    // 📌 Obtener todos los grupos (uso administrativo)
    static async getGroups() {
        const { data, error } = await supabase
            .from("chat_groups")
            .select("*");

        if (error) {
            console.error("❌ Error al obtener los grupos:", error.message);
            throw new Error("No se pudieron obtener los grupos.");
        }

        return data || [];
    }

    // 📌 Obtener un grupo específico por ID
    static async getGroupById(groupId) {
        if (!groupId) throw new Error("ID del grupo no proporcionado.");

        const { data, error } = await supabase
            .from("chat_groups")
            .select("*")
            .eq("id", groupId)
            .single();

        if (error || !data) {
            console.error("❌ Error al obtener el grupo:", error?.message);
            throw new Error("El grupo no existe o no se pudo obtener.");
        }

        return data;
    }

    // 📌 Verificar si un usuario ya es miembro del grupo
    static async isUserInGroup(groupId, userId) {
        if (!groupId || !userId) {
            throw new Error("ID de grupo y usuario requeridos.");
        }

        const { data, error } = await supabase
            .from("group_members")
            .select("id")
            .eq("group_id", groupId)
            .eq("user_id", userId);

        if (error) {
            console.error("❌ Error al verificar membresía:", error.message);
            throw new Error("No se pudo verificar la pertenencia al grupo.");
        }

        return data.length > 0;
    }

    // 📌 Agregar usuario al grupo
    static async addUserToGroup(groupId, userId) {
        if (!groupId || !userId) {
            throw new Error("ID de grupo y usuario requeridos.");
        }

        const { error } = await supabase
            .from("group_members")
            .insert([{ group_id: groupId, user_id: userId }]);

        if (error) {
            console.error("❌ Error al agregar usuario al grupo:", error.message);
            throw new Error("No se pudo agregar el usuario al grupo.");
        }

        return true;
    }

    // 📌 Obtener miembros del grupo (con nombre y correo)
    static async getGroupMembers(groupId) {
        if (!groupId) throw new Error("ID del grupo no proporcionado.");

        const { data, error } = await supabase
            .from("group_members")
            .select(`
                user_id,
                users (
                    name,
                    email
                )
            `)
            .eq("group_id", groupId);

        if (error) {
            console.error("❌ Error al obtener miembros del grupo:", error.message);
            throw new Error("No se pudieron obtener los miembros del grupo.");
        }

        return (data || []).map(member => ({
            id: member.user_id,
            name: member.users?.name || "Desconocido",
            email: member.users?.email || "Sin email"
        }));
    }

    // 📌 Crear grupo
    static async createGroup(name, created_by) {
        if (!name || !created_by) {
            throw new Error("Nombre del grupo y creador son requeridos.");
        }

        const { data, error } = await supabase
            .from("chat_groups")
            .insert([{ name, created_by }])
            .select()
            .single();

        if (error) {
            console.error("❌ Error al crear el grupo:", error.message);
            throw new Error("No se pudo crear el grupo.");
        }

        return data;
    }

    // 📌 Eliminar grupo (y opcionalmente verificar propietario)
    static async deleteGroup(groupId, userId = null) {
        if (!groupId) {
            throw new Error("ID del grupo requerido.");
        }

        let query = supabase
            .from("chat_groups")
            .delete()
            .eq("id", groupId);

        if (userId) {
            query = query.eq("created_by", userId);
        }

        const { error } = await query;

        if (error) {
            console.error("❌ Error al eliminar el grupo:", error.message);
            throw new Error("No se pudo eliminar el grupo.");
        }

        return true;
    }
}

module.exports = Group;
