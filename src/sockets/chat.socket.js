const { Server } = require("socket.io");
const Message = require("../models/message.model");       // Adaptado a Supabase
const Notification = require("../models/notification.model"); // Adaptado a Supabase

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*", // Reemplazar con origen específico en producción
            methods: ["GET", "POST"],
        },
    });

    // Exponer io para otros módulos si es necesario
    global.io = io;

    io.on("connection", (socket) => {
        console.log(`✅ Usuario conectado: ${socket.id}`);

        // 🔐 Unirse a una sala basada en su ID de usuario (para mensajes dirigidos y notificaciones)
        socket.on("joinUserRoom", (userId) => {
            socket.join(`user-${userId}`);
            console.log(`👤 Usuario ${userId} unido a sala user-${userId}`);
        });

        // 📩 Manejar mensajes privados
        socket.on("sendMessage", async ({ sender_id, receiver_id, content }) => {
            try {
                if (!sender_id || !receiver_id || !content) {
                    return console.warn("⚠️ Datos incompletos para sendMessage.");
                }

                // Guardar mensaje en Supabase
                const saved = await Message.createPrivateMessage(sender_id, receiver_id, content);
                const message = saved[0]; // Supabase retorna array

                // Emitir el mensaje a ambos usuarios
                io.to(`user-${receiver_id}`).emit("receiveMessage", message);
                io.to(`user-${sender_id}`).emit("receiveMessage", message);

                // Crear notificación
                const notification = await Notification.createNotification(
                    receiver_id,
                    `Nuevo mensaje de usuario ${sender_id}`,
                    "chat"
                );

                io.to(`user-${receiver_id}`).emit("receiveNotification", {
                    id: notification[0]?.id,
                    message: `Nuevo mensaje de usuario ${sender_id}`,
                    type: "chat",
                    read: false,
                });
            } catch (error) {
                console.error("❌ Error en sendMessage:", error.message);
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔌 Usuario desconectado: ${socket.id}`);
        });
    });
}

module.exports = { setupSocket };
