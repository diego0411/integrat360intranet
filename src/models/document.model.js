const supabase = require("../config/supabase");

class Document {
    // 📄 Crear documento
    static async create({ name, url, folder_id, owner_id }) {
        const { error } = await supabase
            .from("documents")
            .insert([{ name, url, folder_id, owner_id }]);

        if (error) {
            console.error("❌ Error al crear el documento:", error.message);
            throw new Error("No se pudo crear el documento.");
        }
    }

    // 📄 Obtener documentos por carpeta
    static async getByFolder(folder_id) {
        const { data, error } = await supabase
            .from("documents")
            .select("*")
            .eq("folder_id", folder_id);

        if (error) {
            console.error("❌ Error al obtener documentos por carpeta:", error.message);
            throw new Error("No se pudieron obtener los documentos.");
        }

        return data;
    }

    // 📄 Eliminar documento por ID
    static async deleteById(id) {
        const { error } = await supabase
            .from("documents")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("❌ Error al eliminar el documento:", error.message);
            throw new Error("No se pudo eliminar el documento.");
        }
    }

    // 📄 Obtener documentos de un usuario
    static async getByOwner(owner_id) {
        const { data, error } = await supabase
            .from("documents")
            .select("*")
            .eq("owner_id", owner_id);

        if (error) {
            console.error("❌ Error al obtener documentos por usuario:", error.message);
            throw new Error("No se pudieron obtener los documentos.");
        }

        return data;
    }
}

module.exports = Document;
