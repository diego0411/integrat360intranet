const { Server } = require('socket.io');
const Message = require('../models/message.model');
const Notification = require('../models/notification.model');

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`Usuario conectado: ${socket.id}`);

        socket.on('sendMessage', async ({ sender_id, receiver_id, content }) => {
            try {
                const message = await Message.create(sender_id, receiver_id, content);

                // Enviar mensaje en tiempo real
                io.to(receiver_id).emit('receiveMessage', message);
                io.to(sender_id).emit('receiveMessage', message);

                // Crear una notificación para el receptor
                const notification = await Notification.create(receiver_id, `Nuevo mensaje de usuario ${sender_id}`, 'chat');
                io.to(receiver_id).emit('receiveNotification', notification);
            } catch (error) {
                console.error('Error al guardar mensaje:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Usuario desconectado: ${socket.id}`);
        });
    });
}

module.exports = { setupSocket };
