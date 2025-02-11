const express = require("express");
const { 
    createFolder, 
    listFolders, 
    shareFolder, 
    shareFolderWithGroup,  
    deleteFolder 
} = require("../controllers/folder.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", verifyToken, createFolder);
router.get("/", verifyToken, listFolders);
router.post("/share", verifyToken, shareFolder);
router.post("/share/group", verifyToken, shareFolderWithGroup);  
router.delete("/:id", verifyToken, deleteFolder);

module.exports = router;
