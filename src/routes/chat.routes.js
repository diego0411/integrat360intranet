const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const { 
    sendMessage, 
    getPublicMessages, 
    getPrivateMessages, 
    getGroupMessages 
} = require("../controllers/chat.controller");

const router = express.Router();

// 🛡️ Middleware para manejo de errores async
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 📤 Enviar mensaje (público, privado o de grupo)
router.post("/", verifyToken, asyncHandler(sendMessage));

// 📥 Obtener mensajes públicos
router.get("/public", verifyToken, asyncHandler(getPublicMessages));

// 📥 Obtener mensajes privados entre dos usuarios
router.get("/private/:receiver_id", verifyToken, asyncHandler(getPrivateMessages));

// 📥 Obtener mensajes de un grupo
router.get("/group/:group_id", verifyToken, asyncHandler(getGroupMessages));

module.exports = router;
