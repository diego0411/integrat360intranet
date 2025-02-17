const express = require("express");
const multer = require("multer");
const { 
    uploadDocument, 
    downloadDocument, 
    shareDocument // ✅ Se agregó la nueva función
} = require("../controllers/document.controller");

const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 📤 Ruta para subir archivos
router.post("/", verifyToken, upload.single("file"), uploadDocument);

// 📥 Ruta para descargar un documento
router.get("/download/:document_id", verifyToken, downloadDocument);

// 🔗 Ruta para compartir un documento con otro usuario o grupo
router.post("/share", verifyToken, shareDocument);

module.exports = router;
