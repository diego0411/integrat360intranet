const Chat = require('../models/chat.model');

// 📌 Enviar mensaje
exports.sendMessage = async (req, res) => {
    const { message, receiver_id, group_id } = req.body;
    const sender_id = req.user.id;

    if (!message || (!receiver_id && !group_id)) {
        return res.status(400).json({ error: "Mensaje y destinatario/grupo son requeridos" });
    }

    try {
        await Chat.saveMessage(sender_id, receiver_id || null, group_id || null, message);
        res.status(201).json({ message: "Mensaje enviado correctamente" });
    } catch (error) {
        console.error("❌ Error al enviar mensaje:", error);
        res.status(500).json({ error: "Error interno al enviar mensaje" });
    }
};

// 📌 Obtener mensajes públicos
exports.getPublicMessages = async (req, res) => {
    try {
        const [messages] = await Chat.getPublicMessages(); // Extrae el array de resultados
        res.json(messages); // Envía solo los datos sin metadatos de MySQL
    } catch (error) {
        console.error("❌ Error al obtener mensajes públicos:", error);
        res.status(500).json({ error: "Error interno al obtener mensajes" });
    }
};

// 📌 Obtener mensajes privados entre usuarios
exports.getPrivateMessages = async (req, res) => {
    const { receiver_id } = req.params;
    const sender_id = req.user.id;

    try {
        const [messages] = await Chat.getPrivateMessages(sender_id, receiver_id);
        res.json(messages); // Asegura que se devuelvan solo los mensajes
    } catch (error) {
        console.error("❌ Error al obtener mensajes privados:", error);
        res.status(500).json({ error: "Error interno al obtener mensajes" });
    }
};

// 📌 Obtener mensajes de grupo
exports.getGroupMessages = async (req, res) => {
    const { group_id } = req.params;

    try {
        const [messages] = await Chat.getGroupMessages();
        res.json(messages); // Devuelve solo el array de mensajes
    } catch (error) {
        console.error("❌ Error al obtener mensajes de grupo:", error);
        res.status(500).json({ error: "Error interno al obtener mensajes" });
    }
};

