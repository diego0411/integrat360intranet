const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const {
    uploadDocument,
    downloadDocument,
    shareDocument,
    deleteDocument,
} = require("../controllers/document.controller");

const upload = require("../middleware/multer.config"); // Asegúrate que el path sea correcto

const router = express.Router();

// 📤 Subir archivo
router.post("/", verifyToken, upload.single("file"), uploadDocument);

// 📥 Descargar archivo
router.get("/download/:document_id", verifyToken, downloadDocument);

// 🔗 Compartir archivo
router.post("/share", verifyToken, shareDocument);

// 🗑️ Eliminar archivo
router.delete("/:document_id", verifyToken, deleteDocument);

module.exports = router;
