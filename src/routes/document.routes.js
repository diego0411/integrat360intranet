require("dotenv").config();
const express = require("express");
const multer = require("multer");
const {
    uploadDocument,
    downloadDocument,
    shareDocument,
    deleteDocument,
} = require("../controllers/document.controller");

const { verifyToken } = require("../middleware/auth.middleware");
const { listDocumentsByFolder } = require("../controllers/document.controller");

const router = express.Router();

// 📦 multer configuración (archivos en memoria)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// 📤 Subida de documento
router.post("/", verifyToken, upload.single("file"), uploadDocument);

// 📥 Descarga
router.get("/download/:document_id", verifyToken, downloadDocument);

// 🔗 Compartir
router.post("/share", verifyToken, shareDocument);

// 🗑️ Eliminar
router.delete("/:document_id", verifyToken, deleteDocument);

// 📄 Listar documentos por carpeta
router.get("/folder/:folder_id", verifyToken, listDocumentsByFolder);

module.exports = router;
