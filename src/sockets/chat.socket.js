const { Server } = require("socket.io");
const Message = require("../models/message.model");       // ya debe estar adaptado a Supabase
const Notification = require("../models/notification.model"); // también adaptado a Supabase

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`✅ Usuario conectado: ${socket.id}`);

        // 📩 Manejar mensajes privados
        socket.on("sendMessage", async ({ sender_id, receiver_id, content }) => {
            try {
                // Guardar el mensaje en Supabase
                const saved = await Message.createPrivateMessage(sender_id, receiver_id, content);
                const message = saved[0]; // respuesta de Supabase

                // Emitir a ambos usuarios
                io.to(receiver_id).emit("receiveMessage", message);
                io.to(sender_id).emit("receiveMessage", message);

                // Crear una notificación de chat
                const notification = await Notification.createNotification(receiver_id, `Nuevo mensaje de usuario ${sender_id}`, "chat");

                io.to(`user-${receiver_id}`).emit("receiveNotification", {
                    id: notification[0]?.id,
                    message: `Nuevo mensaje de usuario ${sender_id}`,
                    type: "chat",
                    read: false,
                });
            } catch (error) {
                console.error("❌ Error al guardar mensaje o notificación:", error.message);
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔌 Usuario desconectado: ${socket.id}`);
        });
    });
}

module.exports = { setupSocket };
