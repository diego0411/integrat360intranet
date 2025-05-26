const express = require("express");
const {
    createFolder,
    listFolders,
    listProjectFolders,
    shareFolder,
    shareFolderWithGroup,
    deleteFolder,
    getFolderContents,
    moveFolder,
    createProject
} = require("../controllers/folder.controller");

const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// ✅ Rutas que requieren autenticación
router.post("/projects", verifyToken, createProject);         // Crear estructura de proyecto
router.post("/", verifyToken, createFolder);                  // Crear carpeta
router.get("/", verifyToken, listFolders);                    // Listar carpetas propias y compartidas
router.post("/share", verifyToken, shareFolder);              // Compartir con usuario
router.post("/share/group", verifyToken, shareFolderWithGroup); // Compartir con grupo
router.delete("/:id", verifyToken, deleteFolder);             // Eliminar carpeta
router.get("/:folder_id/contents", verifyToken, getFolderContents); // Obtener contenidos
router.put("/move", verifyToken, moveFolder);                 // Mover carpeta

// 🌐 Ruta pública (no requiere autenticación)
router.get("/projects", listProjectFolders); // Ver carpetas públicas del área "proyectos"

module.exports = router;
