const supabase = require("../config/supabase");

class Group {
    // 📌 Obtener todos los grupos
    static async getGroups() {
        const { data, error } = await supabase
            .from("chat_groups")
            .select("*");

        if (error) {
            console.error("❌ Error al obtener los grupos:", error.message);
            throw new Error("No se pudieron obtener los grupos.");
        }

        return data;
    }

    // 📌 Obtener un grupo por su ID
    static async getGroupById(groupId) {
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

    // 📌 Verificar si un usuario ya pertenece a un grupo
    static async isUserInGroup(groupId, userId) {
        const { data, error } = await supabase
            .from("group_members")
            .select("id")
            .eq("group_id", groupId)
            .eq("user_id", userId);

        if (error) {
            console.error("❌ Error al verificar usuario en grupo:", error.message);
            throw new Error("No se pudo verificar el miembro del grupo.");
        }

        return data.length > 0;
    }

    // 📌 Agregar usuario a grupo
    static async addUserToGroup(groupId, userId) {
        const { error } = await supabase
            .from("group_members")
            .insert([{ group_id: groupId, user_id: userId }]);

        if (error) {
            console.error("❌ Error al agregar usuario al grupo:", error.message);
            throw new Error("No se pudo agregar el usuario al grupo.");
        }
    }

    // 📌 Obtener miembros de un grupo (incluye info de usuario)
    static async getGroupMembers(groupId) {
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
            console.error("❌ Error al obtener los miembros del grupo:", error.message);
            throw new Error("No se pudieron obtener los miembros del grupo.");
        }

        return data.map(member => ({
            id: member.user_id,
            name: member.users?.name || "Sin nombre",
            email: member.users?.email || "Sin email"
        }));
    }

    // 📌 Crear un nuevo grupo
    static async createGroup(name, created_by) {
        const { error } = await supabase
            .from("chat_groups")
            .insert([{ name, created_by }]);

        if (error) {
            console.error("❌ Error al crear grupo:", error.message);
            throw new Error("No se pudo crear el grupo.");
        }
    }
}

module.exports = Group;
