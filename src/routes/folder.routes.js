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
const { listFoldersWithDocuments } = require("../controllers/folder.controller");


const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// ✅ Rutas que requieren autenticación
router.post("/projects", verifyToken, createProject);         
router.post("/", verifyToken, createFolder);                  
router.get("/", verifyToken, listFolders);                    
router.post("/share", verifyToken, shareFolder);              
router.post("/share/group", verifyToken, shareFolderWithGroup);
router.delete("/:id", verifyToken, deleteFolder);             
router.get("/:folder_id/contents", verifyToken, getFolderContents);
router.put("/move", verifyToken, moveFolder); 
router.get("/with-documents", verifyToken, listFoldersWithDocuments); // ✅ corregido

// 🌐 Ruta pública
router.get("/projects", listProjectFolders);

module.exports = router;
