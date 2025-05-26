const supabase = require("../config/supabase");

class Group {
    // 📌 Obtener todos los grupos
    static async getGroups() {
        const { data, error } = await supabase.from("chat_groups").select("*");

        if (error) {
            console.error("❌ Error al obtener los grupos:", error.message);
            throw new Error("No se pudieron obtener los grupos.");
        }

        return data;
    }

    // 📌 Obtener un grupo por ID
    static async getGroupById(groupId) {
        const { data, error } = await supabase
            .from("chat_groups")
            .select("*")
            .eq("id", groupId)
            .single();

        if (error) {
            console.error("❌ Error al obtener el grupo:", error.message);
            throw new Error("No se pudo obtener el grupo.");
        }

        return data;
    }

    // 📌 Verificar si un usuario ya está en el grupo
    static async isUserInGroup(groupId, userId) {
        const { data, error } = await supabase
            .from("group_members")
            .select("*")
            .eq("group_id", groupId)
            .eq("user_id", userId);

        if (error) {
            console.error("❌ Error al verificar miembro del grupo:", error.message);
            throw new Error("No se pudo verificar el usuario en el grupo.");
        }

        return data.length > 0;
    }

    // 📌 Agregar usuario al grupo
    static async addUserToGroup(groupId, userId) {
        const { error } = await supabase
            .from("group_members")
            .insert([{ group_id: groupId, user_id: userId }]);

        if (error) {
            console.error("❌ Error al agregar usuario al grupo:", error.message);
            throw new Error("No se pudo agregar el usuario al grupo.");
        }
    }

    // 📌 Obtener miembros de un grupo
    static async getGroupMembers(groupId) {
        const { data, error } = await supabase
            .from("group_members")
            .select("user_id, users(name, email)")
            .eq("group_id", groupId);

        if (error) {
            console.error("❌ Error al obtener los miembros del grupo:", error.message);
            throw new Error("No se pudieron obtener los miembros del grupo.");
        }

        return data.map(entry => ({
            id: entry.user_id,
            name: entry.users.name,
            email: entry.users.email,
        }));
    }

    // 📌 Crear un nuevo grupo
    static async createGroup(name, created_by) {
        const { error } = await supabase
            .from("chat_groups")
            .insert([{ name, created_by }]);

        if (error) {
            console.error("❌ Error al crear el grupo:", error.message);
            throw new Error("No se pudo crear el grupo.");
        }
    }
}

module.exports = Group;
