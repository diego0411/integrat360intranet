const supabase = require("../config/supabase");

class Document {
    // 📄 Crear documento
    static async create({ name, url, folder_id, owner_id, original_name }) {
        const { error } = await supabase
            .from("documents")
            .insert([{
                name,
                url,
                folder_id,
                owner_id,
                original_name
            }]);

        if (error) {
            console.error("❌ Error al crear documento:", error.message);
            throw new Error("No se pudo crear el documento.");
        }
    }

    // 📄 Obtener documentos por ID de carpeta
    static async getByFolder(folder_id) {
        const { data, error } = await supabase
            .from("documents")
            .select("id, name, url, original_name, created_at")
            .eq("folder_id", folder_id);

        if (error) {
            console.error("❌ Error al obtener documentos por carpeta:", error.message);
            throw new Error("No se pudieron obtener los documentos.");
        }

        return data;
    }

    // 📄 Obtener documento por ID
    static async getById(id) {
        const { data, error } = await supabase
            .from("documents")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("❌ Error al obtener documento por ID:", error.message);
            throw new Error("Documento no encontrado.");
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
            console.error("❌ Error al eliminar documento:", error.message);
            throw new Error("No se pudo eliminar el documento.");
        }
    }

    // 📄 Obtener todos los documentos de un usuario
    static async getByOwner(owner_id) {
        const { data, error } = await supabase
            .from("documents")
            .select("id, name, folder_id, url, original_name")
            .eq("owner_id", owner_id);

        if (error) {
            console.error("❌ Error al obtener documentos por usuario:", error.message);
            throw new Error("No se pudieron obtener los documentos.");
        }

        return data;
    }
}

module.exports = Document;
