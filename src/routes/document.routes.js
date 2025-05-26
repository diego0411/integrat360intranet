require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const {
    uploadDocument,
    downloadDocument,
    shareDocument,
    deleteDocument,
} = require("../controllers/document.controller");

const supabase = require("../config/supabase");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// 📦 Configuración de multer (archivos en memoria)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// 📤 Subir documento a Supabase Storage y registrar en la base de datos
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        const folder_id = req.body.folder_id;
        const owner_id = req.user?.id;

        if (!file) {
            return res.status(400).json({ error: "⚠️ No se ha subido ningún archivo." });
        }

        if (!folder_id) {
            return res.status(400).json({ error: "⚠️ Debes seleccionar una carpeta válida." });
        }

        const ext = path.extname(file.originalname);
        const fileName = `documents/${uuidv4()}${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (uploadError) {
            console.error("❌ Error al subir archivo a Supabase:", uploadError.message);
            return res.status(500).json({ error: "❌ No se pudo subir el archivo." });
        }

        const { data: urlData } = supabase
            .storage
            .from("documents")
            .getPublicUrl(fileName);

        if (!urlData?.publicUrl) {
            return res.status(500).json({ error: "❌ No se pudo obtener la URL del archivo." });
        }

        // 🔁 Agregamos datos al request para el controlador
        req.uploadedFile = {
            fileName,
            originalName: file.originalname,
            url: urlData.publicUrl,
            mimetype: file.mimetype,
            folder_id,
            owner_id
        };

        await uploadDocument(req, res);
    } catch (error) {
        console.error("❌ Error general al subir documento:", error.message);
        res.status(500).json({ error: "❌ Error interno del servidor." });
    }
});

// 📥 Descargar documento
router.get("/download/:document_id", verifyToken, downloadDocument);

// 🔗 Compartir documento
router.post("/share", verifyToken, shareDocument);

// 🗑️ Eliminar documento
router.delete("/:document_id", verifyToken, deleteDocument);

module.exports = router;
