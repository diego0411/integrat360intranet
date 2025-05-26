const { Server } = require("socket.io");

let io;

function setupSockets(server) {
    if (!server) {
        throw new Error("❌ No se proporcionó un servidor para inicializar Socket.io.");
    }

    if (!io) {  // Evitar reinicialización
        io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        io.on("connection", (socket) => {
            console.log(`🔔 Usuario conectado a notificaciones: ${socket.id}`);

            // 📌 Escuchar eventos de notificación
            socket.on("sendNotification", (notification) => {
                console.log("📢 Nueva notificación recibida:", notification);
                io.emit("receiveNotification", notification); // Enviar a todos los usuarios
            });

            socket.on("disconnect", () => {
                console.log(`🔴 Usuario desconectado de notificaciones: ${socket.id}`);
            });
        });
    } else {
        console.log("⚠️ Socket.io ya estaba inicializado.");
    }
}

function getIO() {
    if (!io) {
        throw new Error("❌ Socket.io no ha sido inicializado para notificaciones.");
    }
    return io;
}

// 📌 Exportar las funciones correctamente
module.exports = { setupSockets, getIO };
