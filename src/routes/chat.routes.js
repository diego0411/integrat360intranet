const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const { 
    sendMessage, 
    getPublicMessages, 
    getPrivateMessages, 
    getGroupMessages 
} = require("../controllers/chat.controller");

const router = express.Router();

// 📌 Enviar mensaje
router.post("/", verifyToken, sendMessage);

// 📌 Obtener mensajes públicos
router.get("/public", verifyToken, getPublicMessages);

// 📌 Obtener mensajes privados entre usuarios
router.get("/private/:receiver_id", verifyToken, getPrivateMessages);

// 📌 Obtener mensajes de grupo
router.get("/group/:group_id", verifyToken, getGroupMessages);

module.exports = router;
