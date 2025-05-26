const supabase = require("../config/supabase");

class Folder {
    // 📁 Crear nueva carpeta
    static async create(name, owner_id) {
        const { error } = await supabase
            .from("folders")
            .insert([{ name, owner_id }]);

        if (error) {
            console.error("❌ Error al crear carpeta:", error.message);
            throw new Error("No se pudo crear la carpeta.");
        }
    }

    // 📁 Obtener carpetas por propietario
    static async getByOwner(owner_id) {
        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .eq("owner_id", owner_id);

        if (error) {
            console.error("❌ Error al obtener carpetas:", error.message);
            throw new Error("No se pudieron obtener las carpetas.");
        }

        return data;
    }

    // 📁 Eliminar carpeta por ID
    static async delete(id) {
        const { error } = await supabase
            .from("folders")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("❌ Error al eliminar la carpeta:", error.message);
            throw new Error("No se pudo eliminar la carpeta.");
        }
    }

    // 📁 Compartir carpeta con usuario
    static async shareWithUser(folderId, userId) {
        const { error } = await supabase
            .from("folder_shares")
            .insert([{ folder_id: folderId, user_id: userId }]);

        if (error) {
            console.error("❌ Error al compartir carpeta con usuario:", error.message);
            throw new Error("No se pudo compartir la carpeta.");
        }
    }

    // 📁 Compartir carpeta con grupo
    static async shareWithGroup(folderId, groupId) {
        const { error } = await supabase
            .from("folder_shares")
            .insert([{ folder_id: folderId, group_id: groupId }]);

        if (error) {
            console.error("❌ Error al compartir carpeta con grupo:", error.message);
            throw new Error("No se pudo compartir la carpeta.");
        }
    }

    // 📁 Obtener carpetas compartidas a través de grupos del usuario
    static async getSharedWithGroups(userId) {
        const { data, error } = await supabase.rpc("get_shared_folders_by_user", { user_id_input: userId });

        if (error) {
            console.error("❌ Error al obtener carpetas compartidas por grupo:", error.message);
            throw new Error("No se pudieron obtener las carpetas compartidas.");
        }

        return data;
    }
}

module.exports = Folder;
