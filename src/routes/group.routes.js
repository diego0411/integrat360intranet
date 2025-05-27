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

// 📌 Middleware para manejo de errores async de forma segura
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ✅ Crear un nuevo grupo
router.post("/", verifyToken, asyncHandler(createGroup));

// ✅ Obtener todos los grupos del usuario (creados o donde es miembro)
router.get("/", verifyToken, asyncHandler(getGroups));

// ✅ Obtener miembros de un grupo
router.get("/:groupId/members", verifyToken, asyncHandler(getGroupMembers));

// ✅ Agregar usuario a un grupo (solo el creador puede)
router.post("/:groupId/members", verifyToken, asyncHandler(addUserToGroup));

// ✅ Eliminar un grupo (solo el creador puede)
router.delete("/:groupId", verifyToken, asyncHandler(deleteGroup));

module.exports = router;
