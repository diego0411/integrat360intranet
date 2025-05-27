const { Server } = require("socket.io");

let io;

function setupSockets(server) {
    if (!server) {
        throw new Error("❌ No se proporcionó un servidor para inicializar Socket.io.");
    }

    if (io) {
        console.warn("⚠️ Socket.io ya estaba inicializado. Usando instancia existente.");
        return;
    }

    io = new Server(server, {
        cors: {
            origin: "*", // En producción, reemplaza con el dominio de tu frontend
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`🔔 Usuario conectado: ${socket.id}`);

        // 🎯 Unirse a una sala individual basada en ID de usuario
        socket.on("joinUserRoom", (userId) => {
            if (userId) {
                socket.join(`user-${userId}`);
                console.log(`✅ Usuario ${userId} se unió a la sala user-${userId}`);
            }
        });

        // 🔔 Enviar notificación directa
        socket.on("sendNotification", ({ userId, title, message, type = "info" }) => {
            if (!userId || !message) {
                console.warn("⚠️ Notificación inválida: falta userId o mensaje.");
                return;
            }

            const payload = { title, message, type, read: false };
            console.log(`📨 Enviando notificación a user-${userId}:`, payload);
            io.to(`user-${userId}`).emit("receiveNotification", payload);
        });

        // 📢 Notificación pública para todos los usuarios
        socket.on("sendGlobalNotification", ({ title, message, type = "info" }) => {
            if (!title || !message) {
                console.warn("⚠️ Notificación global inválida.");
                return;
            }

            const payload = { title, message, type, read: false };
            console.log("📢 Notificación global enviada:", payload);
            io.emit("receiveNotification", payload);
        });

        socket.on("disconnect", () => {
            console.log(`🔌 Usuario desconectado: ${socket.id}`);
        });
    });
}

function getIO() {
    if (!io) {
        throw new Error("❌ Socket.io no ha sido inicializado.");
    }
    return io;
}

module.exports = { setupSockets, getIO };
