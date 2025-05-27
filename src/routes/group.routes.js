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

// 📌 Middleware universal para capturar errores async sin romper el flujo
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ✅ Crear un grupo (solo usuarios autenticados)
router.post("/", verifyToken, asyncHandler(createGroup));

// ✅ Obtener los grupos en los que el usuario es creador o miembro
router.get("/", verifyToken, asyncHandler(getGroups));

// ✅ Obtener miembros de un grupo
router.get("/:groupId/members", verifyToken, asyncHandler(getGroupMembers));

// ✅ Agregar usuario a un grupo (solo el creador del grupo puede)
router.post("/:groupId/members", verifyToken, asyncHandler(addUserToGroup));

// ✅ Eliminar un grupo (solo el creador del grupo puede hacerlo)
router.delete("/:groupId", verifyToken, asyncHandler(deleteGroup));

module.exports = router;
