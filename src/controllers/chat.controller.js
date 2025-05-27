const Chat = require('../models/chat.model');

// 📌 Enviar mensaje
exports.sendMessage = async (req, res) => {
    try {
        const { message, receiver_id, group_id } = req.body;
        const sender_id = req.user.id;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: "❌ El mensaje no puede estar vacío." });
        }

        if (!receiver_id && !group_id) {
            console.log("📢 Enviando mensaje público:", message);
            await Chat.createPublicMessage(sender_id, message);
            return res.status(201).json({ message: "Mensaje público enviado correctamente." });
        }

        if (receiver_id) {
            console.log(`📩 Enviando mensaje privado a ${receiver_id}:`, message);
            await Chat.saveMessage(sender_id, receiver_id, null, message);
        } else if (group_id) {
            console.log(`👥 Enviando mensaje grupal a ${group_id}:`, message);
            await Chat.saveMessage(sender_id, null, group_id, message);
        }

        res.status(201).json({ message: "Mensaje enviado correctamente." });
    } catch (error) {
        console.error("❌ Error al enviar mensaje:", error);
        res.status(500).json({ error: "Error interno al enviar el mensaje." });
    }
};

// 📏 Obtener mensajes públicos
exports.getPublicMessages = async (req, res) => {
    try {
        const messages = await Chat.getPublicMessages();
        res.json(messages);
    } catch (error) {
        console.error("❌ Error al obtener mensajes públicos:", error);
        res.status(500).json({ error: "Error interno al obtener mensajes." });
    }
};

// 📏 Obtener mensajes privados entre usuarios
exports.getPrivateMessages = async (req, res) => {
    const { receiver_id } = req.params;
    const sender_id = req.user.id;

    try {
        const messages = await Chat.getPrivateMessages(sender_id, receiver_id);
        res.json(messages);
    } catch (error) {
        console.error("❌ Error al obtener mensajes privados:", error);
        res.status(500).json({ error: "Error interno al obtener mensajes." });
    }
};

// 📏 Obtener mensajes de grupo
exports.getGroupMessages = async (req, res) => {
    const { group_id } = req.params;

    if (!group_id || !group_id.match(/^[0-9a-fA-F\-]{36}$/)) {
        return res.status(400).json({ error: "❌ group_id es requerido o inválido." });
    }

    try {
        console.log(`👥 Obteniendo mensajes para el grupo: ${group_id}`);
        const messages = await Chat.getGroupMessages(group_id);
        res.json(messages);
    } catch (error) {
        console.error("❌ Error al obtener mensajes de grupo:", error);
        res.status(500).json({ error: "Error interno al obtener mensajes." });
    }
};