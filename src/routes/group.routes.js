const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const {
    createGroup,
    getGroups,
    getGroupMembers,
    addUserToGroup,
    deleteGroup
} = require("../controllers/group.controller");

const router = express.Router();

// ✅ Crear un grupo
router.post("/", verifyToken, createGroup);

// ✅ Obtener todos los grupos del usuario
router.get("/", verifyToken, getGroups);

// ✅ Obtener miembros de un grupo
router.get("/:groupId/members", verifyToken, getGroupMembers);

// ✅ Agregar un usuario a un grupo
router.post("/:groupId/members", verifyToken, addUserToGroup);

// ✅ Eliminar un grupo (solo el creador)
router.delete("/:groupId", verifyToken, deleteGroup);

module.exports = router;
