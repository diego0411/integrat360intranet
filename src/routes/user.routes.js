const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const { verifyAdmin } = require("../middleware/admin.middleware");
const { getBirthdayUsers } = require("../controllers/user.controller");
const { getUpcomingBirthdays } = require("../controllers/user.controller");
const { getUsers, registerUser, updateUser, deleteUser } = require("../controllers/user.controller");

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getUsers); // Obtener usuarios (solo admin)
router.post("/register", registerUser); // Registrar usuario (sin autenticación)
router.put("/:id", verifyToken, verifyAdmin, updateUser); // Editar usuario (solo admin)
router.delete("/:id", verifyToken, verifyAdmin, deleteUser); // Eliminar usuario (solo admin)
// 📌 Obtener lista de cumpleaños de hoy
router.get("/birthdays", verifyToken, getBirthdayUsers);
router.get("/birthdays", verifyToken, getUpcomingBirthdays);

module.exports = router;
















