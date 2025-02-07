const multer = require("multer");
const path = require("path");

// Configuración de almacenamiento con Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Renombrar archivos
    },
});

const upload = multer({ storage });

module.exports = upload;
