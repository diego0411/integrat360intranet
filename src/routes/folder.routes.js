const express = require("express");
const { createFolder, listFolders, shareFolder, listUsers, deleteFolder } = require("../controllers/folder.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", verifyToken, createFolder);
router.get("/", verifyToken, listFolders);
router.post("/share", verifyToken, shareFolder);
router.get("/users", verifyToken, listUsers);
router.delete("/:id", verifyToken, deleteFolder);

module.exports = router;
