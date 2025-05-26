const path = require("path");
const { v4: uuidv4 } = require("uuid");
const supabase = require("../config/supabase");

// 📤 Subir documento a Supabase Storage y guardar en la BD
const uploadDocument = async (req, res) => {
    try {
        const file = req.file;
        const folder_id = req.body.folder_id ? Number(req.body.folder_id) : null;
        const owner_id = req.user?.id || null;

        if (!file) {
            return res.status(400).json({ error: "⚠️ No se ha subido ningún archivo." });
        }

        if (!folder_id) {
            return res.status(400).json({ error: "⚠️ Debes seleccionar una carpeta válida." });
        }

        const ext = path.extname(file.originalname);
        const fileName = `documents/${uuidv4()}${ext}`;

        // ✅ Subir archivo a Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            });

        if (uploadError) {
            console.error("❌ Error al subir archivo:", uploadError.message);
            return res.status(500).json({ error: "❌ No se pudo subir el archivo." });
        }

        const { data: urlData } = supabase
            .storage
            .from("documents")
            .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        // ✅ Guardar metadata en base de datos
        const { error: dbError, data } = await supabase
            .from("documents")
            .insert([{
                name: fileName,
                folder_id,
                owner_id,
                url: publicUrl,
                original_name: file.originalname
            }]);

        if (dbError) {
            console.error("❌ Error al guardar en la base de datos:", dbError.message);
            return res.status(500).json({ error: "❌ No se pudo guardar el documento." });
        }

        res.status(201).json({
            message: "✅ Documento subido exitosamente",
            url: publicUrl,
        });

    } catch (error) {
        console.error("❌ Error general:", error.message);
        res.status(500).json({ error: "❌ Error interno en la subida del documento." });
    }
};

// 📥 Descargar documento (retorna URL)
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
        console.error("❌ Error al descargar:", error.message);
        res.status(500).json({ error: "❌ Error interno en la descarga." });
    }
};

// 🔗 Compartir documento
const shareDocument = async (req, res) => {
    try {
        const { document_id, user_id, group_id } = req.body;
        const owner_id = req.user?.id || null;

        if (!document_id || (!user_id && !group_id)) {
            return res.status(400).json({ error: "⚠️ Se debe especificar un usuario o grupo." });
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
            console.error("❌ Error al compartir:", error.message);
            return res.status(500).json({ error: "❌ Error al compartir el documento." });
        }

        res.json({ message: "✅ Documento compartido correctamente." });
    } catch (error) {
        console.error("❌ Error general al compartir:", error.message);
        res.status(500).json({ error: "❌ Error interno al compartir el documento." });
    }
};

// 🗑️ Eliminar documento
const deleteDocument = async (req, res) => {
    try {
        const { document_id } = req.params;

        // Obtener el documento
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
            console.error("❌ Error al eliminar archivo:", storageError.message);
            return res.status(500).json({ error: "❌ No se pudo eliminar el archivo." });
        }

        // Eliminar de la base de datos
        const { error: deleteError } = await supabase
            .from("documents")
            .delete()
            .eq("id", document_id);

        if (deleteError) {
            console.error("❌ Error al eliminar metadata:", deleteError.message);
            return res.status(500).json({ error: "❌ Error al eliminar de la base de datos." });
        }

        res.json({ message: "✅ Documento eliminado correctamente." });

    } catch (error) {
        console.error("❌ Error general al eliminar:", error.message);
        res.status(500).json({ error: "❌ Error interno al eliminar el documento." });
    }
};

// ✅ Exportar funciones
module.exports = {
    uploadDocument,
    downloadDocument,
    shareDocument,
    deleteDocument,
};
