const express = require("express");
const { uploadDocument, getFolderDocuments, deleteDocument } = require("../controllers/document.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post("/", verifyToken, upload.single("file"), uploadDocument); // 🔥 Verifica que uploadDocument está definido
router.get("/:folder_id", verifyToken, getFolderDocuments);
router.delete("/:id", verifyToken, deleteDocument);

module.exports = router;
