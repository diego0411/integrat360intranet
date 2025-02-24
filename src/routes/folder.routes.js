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
} = require("../controllers/folder.controller"); // ✅ CORRECTO

const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// 📌 Rutas protegidas (requieren autenticación)
router.post("/projects", verifyToken, createProject); // ✅ MOVIDO ARRIBA
router.post("/", verifyToken, createFolder);
router.get("/", verifyToken, listFolders);
router.post("/share", verifyToken, shareFolder);
router.post("/share/group", verifyToken, shareFolderWithGroup);
router.delete("/:id", verifyToken, deleteFolder);
router.get("/:folder_id/contents", verifyToken, getFolderContents);
router.put("/move", verifyToken, moveFolder);

// 📌 Rutas públicas (sin autenticación)

router.get("/projects", listProjectFolders); // ✅ Se mantiene pública pero ahora está después

module.exports = router;
