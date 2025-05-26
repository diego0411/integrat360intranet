require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const {
    uploadDocument,
    downloadDocument,
    shareDocument,
    deleteDocument,
} = require("../controllers/document.controller");

const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// 📌 Verificación de configuración de AWS antes de inicializar
const requiredEnvVars = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_S3_BUCKET"];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.error(`❌ ERROR: Falta la variable de entorno ${varName}`);
        process.exit(1);
    }
});

// 📌 Configurar cliente AWS S3 con SDK v3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// 📌 Configurar `multer` para subir archivos directamente a S3 con nombres sanitizados
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
       
        contentType: multerS3.AUTO_CONTENT_TYPE, // 📌 Detecta automáticamente el tipo de contenido
        key: (req, file, cb) => {
            const sanitizedFilename = file.originalname.replace(/\s+/g, "_"); // Evitar espacios en nombres de archivos
            const filename = `documents/${Date.now()}_${sanitizedFilename}`;
            cb(null, filename);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 📌 Límite de 10MB por archivo
});

// 📤 **Ruta para subir archivos a S3**
router.post("/", verifyToken, (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            console.error("❌ Error en la subida de archivos:", err);
            return res.status(400).json({ error: "⚠️ Error al subir el archivo. Revisa el tamaño o el formato." });
        }
        next();
    });
}, uploadDocument);

// 📥 **Ruta para descargar un documento**
router.get("/download/:document_id", verifyToken, downloadDocument);

// 🔗 **Ruta para compartir un documento con otro usuario o grupo**
router.post("/share", verifyToken, shareDocument);

// 🗑️ **Ruta para eliminar un documento de S3 y la base de datos**
router.delete("/:document_id", verifyToken, deleteDocument);

module.exports = router;
