const supabase = require("../config/supabase");

class Folder {
    // 📁 Crear nueva carpeta
    static async create(name, owner_id, parent_id = null, area = null) {
        if (!name || !owner_id) {
            throw new Error("⚠️ El nombre y el ID del propietario son obligatorios.");
        }

        const { data, error } = await supabase
            .from("folders")
            .insert([{ name, owner_id, parent_id, area }])
            .select()
            .single();

        if (error) {
            console.error("❌ Error al crear carpeta:", error.message);
            throw new Error("No se pudo crear la carpeta.");
        }

        return data;
    }

    // 📁 Obtener carpetas por propietario
    static async getByOwner(owner_id) {
        if (!owner_id) {
            throw new Error("⚠️ Se requiere el ID del propietario.");
        }

        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .eq("owner_id", owner_id);

        if (error) {
            console.error("❌ Error al obtener carpetas del propietario:", error.message);
            throw new Error("No se pudieron obtener las carpetas.");
        }

        return data;
    }

    // 📁 Eliminar carpeta por ID
    static async delete(id) {
        if (!id) {
            throw new Error("⚠️ Se requiere un ID de carpeta válido.");
        }

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
        if (!folderId || !userId) {
            throw new Error("⚠️ Se requieren folderId y userId.");
        }

        const { error } = await supabase
            .from("folder_shares")
            .insert([{ folder_id: folderId, user_id: userId }]);

        if (error) {
            console.error("❌ Error al compartir carpeta con usuario:", error.message);
            throw new Error("No se pudo compartir la carpeta con el usuario.");
        }
    }

    // 📁 Compartir carpeta con grupo
    static async shareWithGroup(folderId, groupId) {
        if (!folderId || !groupId) {
            throw new Error("⚠️ Se requieren folderId y groupId.");
        }

        const { error } = await supabase
            .from("folder_shares")
            .insert([{ folder_id: folderId, group_id: groupId }]);

        if (error) {
            console.error("❌ Error al compartir carpeta con grupo:", error.message);
            throw new Error("No se pudo compartir la carpeta con el grupo.");
        }
    }

    // 📁 Obtener carpetas compartidas con el usuario mediante grupos
    static async getSharedWithGroups(userId) {
        if (!userId) {
            throw new Error("⚠️ Se requiere el ID del usuario.");
        }

        const { data, error } = await supabase
            .rpc("get_shared_folders_by_user", { user_id_input: userId });

        if (error) {
            console.error("❌ Error al obtener carpetas compartidas por grupo:", error.message);
            throw new Error("No se pudieron obtener las carpetas compartidas.");
        }

        return data;
    }
}

module.exports = Folder;
