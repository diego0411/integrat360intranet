const path = require("path");
const { v4: uuidv4 } = require("uuid");
const supabase = require("../config/supabase");
const Document = require("../models/document.model");

// 📤 Subir documento a Supabase Storage y guardar metadata
const uploadDocument = async (req, res) => {
    try {
        const file = req.file;
        const folder_id = req.body.folder_id;
        const owner_id = req.user?.id || null;

        if (!file) return res.status(400).json({ error: "⚠️ Archivo no recibido." });

        if (!folder_id || !folder_id.match(/^[0-9a-fA-F\-]{36}$/)) {
            return res.status(400).json({ error: "⛔ folder_id inválido o ausente." });
        }

        const ext = path.extname(file.originalname);
        const fileName = `documents/${uuidv4()}${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            });

        if (uploadError) {
            console.error("❌ Error en Storage:", uploadError.message);
            return res.status(500).json({ error: "❌ Falló la subida al almacenamiento." });
        }

        const { data: urlData } = supabase.storage
            .from("documents")
            .getPublicUrl(fileName);

        const publicUrl = urlData?.publicUrl;
        if (!publicUrl) {
            return res.status(500).json({ error: "❌ No se pudo obtener URL pública." });
        }

        const document = await Document.create({
            name: fileName,
            original_name: file.originalname,
            url: publicUrl,
            folder_id,
            owner_id
        });

        res.status(201).json({
            message: "✅ Documento subido con éxito.",
            document
        });
    } catch (error) {
        console.error("❌ Error general en uploadDocument:", error.message);
        res.status(500).json({ error: "❌ Error interno del servidor." });
    }
};

// 📥 Obtener URL pública de un documento por ID
const downloadDocument = async (req, res) => {
    try {
        const { document_id } = req.params;

        const doc = await Document.getById(document_id);
        if (!doc || !doc.url) {
            return res.status(404).json({ error: "⚠️ Documento no encontrado o sin URL válida." });
        }

        res.json({ downloadUrl: doc.url });
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
            inserts.push({ document_id, shared_with_user: user_id, owner_id });
        }
        if (group_id) {
            inserts.push({ document_id, shared_with_group: group_id, owner_id });
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

// 🗑️ Eliminar documento y su archivo del Storage
const deleteDocument = async (req, res) => {
    try {
        const { document_id } = req.params;

        const doc = await Document.getById(document_id);
        if (!doc || !doc.name) {
            return res.status(404).json({ error: "⚠️ Documento no encontrado o sin nombre de archivo." });
        }

        const { error: storageError } = await supabase.storage
            .from("documents")
            .remove([doc.name]);

        if (storageError) {
            console.error("❌ Error al eliminar del Storage:", storageError.message);
            return res.status(500).json({ error: "❌ Falló la eliminación en el almacenamiento." });
        }

        await Document.deleteById(document_id);

        res.json({ message: "✅ Documento eliminado correctamente." });
    } catch (error) {
        console.error("❌ Error en deleteDocument:", error.message);
        res.status(500).json({ error: "❌ Error interno del servidor." });
    }
};

// 📄 Listar o buscar documentos por carpeta
const listDocumentsByFolder = async (req, res) => {
    const { folder_id } = req.params;
    const { search } = req.query;

    if (!folder_id || !folder_id.match(/^[0-9a-fA-F\-]{36}$/)) {
        return res.status(400).json({ error: "⛔ folder_id inválido o ausente." });
    }

    try {
        const docs = search && search.trim().length > 0
            ? await Document.searchInFolder(folder_id, search.trim())
            : await Document.getByFolder(folder_id);

        res.json(docs);
    } catch (error) {
        console.error("❌ Error al listar documentos:", error.message);
        res.status(500).json({ error: "❌ Error interno al listar documentos." });
    }
};

module.exports = {
    uploadDocument,
    downloadDocument,
    shareDocument,
    deleteDocument,
    listDocumentsByFolder,
};
