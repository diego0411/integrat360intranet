const express = require("express");
const { login, register, getMe } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// 📌 Registro e inicio de sesión
router.post("/register", register);
router.post("/login", login);

// 📌 Obtener el usuario autenticado
router.get("/me", verifyToken, getMe);
router.get("/user", verifyToken, getMe); // 🔁 Alias para compatibilidad con el frontend

module.exports = router;
