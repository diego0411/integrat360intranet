const Event = require('../models/event.model');



// 📌 Crear un evento
exports.createEvent = async (req, res) => {
    console.log("📥 Datos recibidos:", req.body);
    

    const { title, description, date, visibility } = req.body;
    const created_by = req.user?.id;
    console.log( req.user?.id  );

    // ✅ Validación de datos
    if (!title || !date || !visibility) {
        return res.status(400).json({ error: 'Título, fecha y visibilidad son obligatorios' });
    }

    try {
        const result = await Event.create(title, description, date, created_by, visibility);

        // ✅ Confirmar si el evento fue creado correctamente
        if (result.affectedRows > 0) {
            return res.status(201).json({ message: 'Evento creado exitosamente', event_id: result.insertId });
        } else {
            throw new Error("No se pudo crear el evento.");
        }
    } catch (error) {
        console.error("❌ Error al crear evento:", error);
        res.status(500).json({ error: "Error interno al crear el evento." });
    }
};

// 📌 Obtener eventos públicos
exports.getPublicEvents = async (req, res) => {
    try {
        const events = await Event.getPublicEvents();

        if (!events.length) {
            return res.status(404).json({ message: "No hay eventos públicos disponibles." });
        }

        res.json(events);
    } catch (error) {
        console.error("❌ Error al obtener eventos públicos:", error);
        res.status(500).json({ error: "Error interno al obtener eventos públicos." });
    }
};

// 📌 Obtener eventos creados por el usuario
exports.getUserEvents = async (req, res) => {
    const user_id = req.user?.id;

    try {
        const events = await Event.getUserEvents(user_id);

        if (!events.length) {
            return res.status(404).json({ message: "No tienes eventos registrados." });
        }

        res.json(events);
    } catch (error) {
        console.error("❌ Error al obtener eventos del usuario:", error);
        res.status(500).json({ error: "Error interno al obtener eventos del usuario." });
    }
};

// 📌 Eliminar un evento
exports.deleteEvent = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user?.id;

    // ✅ Validación del ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID de evento inválido' });
    }

    try {
        const result = await Event.delete(id, user_id);

        if (result.affectedRows === 0) {
            return res.status(403).json({ error: 'No tienes permisos para eliminar este evento o el evento no existe.' });
        }

        res.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
        console.error("❌ Error al eliminar evento:", error);
        res.status(500).json({ error: "Error interno al eliminar el evento." });
    }
};
