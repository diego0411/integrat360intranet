const path = require("path");
const { v4: uuidv4 } = require("uuid");
const supabase = require("../config/supabase");

// 📤 Subir documento a Supabase Storage y guardar metadata
const uploadDocument = async (req, res) => {
    try {
        const file = req.file;
        const folder_id = parseInt(req.body.folder_id, 10);
        const owner_id = req.user?.id || null;

        if (!file) return res.status(400).json({ error: "⚠️ Archivo no recibido." });
        if (!folder_id) return res.status(400).json({ error: "⚠️ Carpeta no especificada." });

        const ext = path.extname(file.originalname);
        const fileName = `documents/${uuidv4()}${ext}`;

        // Subida al Storage
        const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            });

        if (uploadError) {
            console.error("❌ Error en Storage:", uploadError.message);
            return res.status(500).json({ error: "❌ Falló la subida al almacenamiento." });
        }

        const { data: urlData } = supabase
            .storage
            .from("documents")
            .getPublicUrl(fileName);

        const publicUrl = urlData?.publicUrl;
        if (!publicUrl) {
            return res.status(500).json({ error: "❌ No se pudo obtener URL pública." });
        }

        // Registro en la base de datos
        const { data, error: dbError } = await supabase
            .from("documents")
            .insert([{
                name: fileName,
                folder_id,
                owner_id,
                url: publicUrl,
                original_name: file.originalname
            }])
            .select()
            .single();

        if (dbError) {
            console.error("❌ Error al guardar metadata:", dbError.message);
            return res.status(500).json({ error: "❌ Error guardando el documento en la base de datos." });
        }

        res.status(201).json({
            message: "✅ Documento subido con éxito.",
            document: data
        });

    } catch (error) {
        console.error("❌ Error general en uploadDocument:", error.message);
        res.status(500).json({ error: "❌ Error interno del servidor." });
    }
};

// 📥 Obtener URL pública para descargar documento
const downloadDocument = async (req, res) => {
    try {
        const { document_id } = req.params;

        const { data, error } = await supabase
            .from("documents")
            .select("url")
            .eq("id", document_id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: "⚠️ Documento no encontrado." });
        }

        res.json({ downloadUrl: data.url });
    } catch (error) {
        console.error("❌ Error en downloadDocument:", error.message);
        res.status(500).json({ error: "❌ Error interno del servidor." });
    }
};

// 🔗 Compartir documento con usuario o grupo
const shareDocument = async (req, res) => {
    try {
        const { document_id, user_id, group_id } = req.body;
        const owner_id = req.user?.id || null;

        if (!document_id || (!user_id && !group_id)) {
            return res.status(400).json({ error: "⚠️ Debes especificar documento y usuario o grupo." });
        }

        const inserts = [];

        if (user_id) {
            inserts.push({
                document_id,
                shared_with_user: user_id,
                owner_id,
            });
        }

        if (group_id) {
            inserts.push({
                document_id,
                shared_with_group: group_id,
                owner_id,
            });
        }

        const { error } = await supabase
            .from("shared_documents")
            .insert(inserts);

        if (error) {
            console.error("❌ Error compartiendo documento:", error.message);
            return res.status(500).json({ error: "❌ Error al compartir el documento." });
        }

        res.json({ message: "✅ Documento compartido correctamente." });
    } catch (error) {
        console.error("❌ Error en shareDocument:", error.message);
        res.status(500).json({ error: "❌ Error interno del servidor." });
    }
};

// 🗑️ Eliminar documento y archivo de Supabase Storage
const deleteDocument = async (req, res) => {
    try {
        const { document_id } = req.params;

        // Obtener nombre del archivo
        const { data: doc, error } = await supabase
            .from("documents")
            .select("name")
            .eq("id", document_id)
            .single();

        if (error || !doc) {
            return res.status(404).json({ error: "⚠️ Documento no encontrado." });
        }

        // Eliminar de Supabase Storage
        const { error: storageError } = await supabase
            .storage
            .from("documents")
            .remove([doc.name]);

        if (storageError) {
            console.error("❌ Error al eliminar del Storage:", storageError.message);
            return res.status(500).json({ error: "❌ Falló la eliminación en el almacenamiento." });
        }

        // Eliminar metadata
        const { error: dbError } = await supabase
            .from("documents")
            .delete()
            .eq("id", document_id);

        if (dbError) {
            console.error("❌ Error al eliminar metadata:", dbError.message);
            return res.status(500).json({ error: "❌ Falló la eliminación en la base de datos." });
        }

        res.json({ message: "✅ Documento eliminado correctamente." });

    } catch (error) {
        console.error("❌ Error en deleteDocument:", error.message);
        res.status(500).json({ error: "❌ Error interno del servidor." });
    }
};

module.exports = {
    uploadDocument,
    downloadDocument,
    shareDocument,
    deleteDocument,
};
