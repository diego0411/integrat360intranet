const multer = require("multer");

// ✅ Guardar archivo en memoria para subirlo a Supabase Storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // Limita a 20MB
});

module.exports = upload;
