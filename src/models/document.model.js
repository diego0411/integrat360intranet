const supabase = require("../config/supabase");

class Document {
    // 📄 Crear documento y devolverlo
    static async create({ name, url, folder_id, owner_id, original_name }) {
        const { data, error } = await supabase
            .from("documents")
            .insert([{
                name,
                url,
                folder_id,
                owner_id,
                original_name
            }])
            .select()
            .single();

        if (error) {
            console.error("❌ Error al crear documento:", error.message);
            throw new Error("No se pudo crear el documento.");
        }

        return data;
    }

    // 📄 Obtener documentos por carpeta (ordenados por fecha desc)
    static async getByFolder(folder_id) {
        const { data, error } = await supabase
            .from("documents")
            .select("id, name, url, original_name, created_at")
            .eq("folder_id", folder_id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("❌ Error al obtener documentos por carpeta:", error.message);
            throw new Error("No se pudieron obtener los documentos.");
        }

        return data;
    }

    // 📄 Obtener un documento por ID
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

    // 🗑️ Eliminar documento por ID
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

    // 📄 Obtener documentos por propietario
    static async getByOwner(owner_id) {
        const { data, error } = await supabase
            .from("documents")
            .select("id, name, folder_id, url, original_name, created_at")
            .eq("owner_id", owner_id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("❌ Error al obtener documentos del usuario:", error.message);
            throw new Error("No se pudieron obtener los documentos del usuario.");
        }

        return data;
    }

    // 🔍 Buscar documentos por nombre dentro de una carpeta (case-insensitive)
    static async searchInFolder(folder_id, search) {
        const { data, error } = await supabase
            .from("documents")
            .select("id, name, url, original_name, created_at")
            .eq("folder_id", folder_id)
            .ilike("original_name", `%${search}%`)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("❌ Error al buscar documentos:", error.message);
            throw new Error("Error al buscar documentos.");
        }

        return data;
    }
}

module.exports = Document;
