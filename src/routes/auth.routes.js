const express = require("express");
const { login, register, getMe } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware"); // 🔥 Importar el middleware de autenticación

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe); // 🔥 Ahora `verifyToken` está definido

module.exports = router;
