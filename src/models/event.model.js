const db = require('../config/db');

class Event {
    // 📌 Crear un evento
    static async create(title, description, date, created_by, visibility) {
        try {
            const [result] = await db.execute(
                'INSERT INTO events (title, description, date, created_by, visibility) VALUES (?, ?, ?, ?, ?)',
                [title, description, date, created_by, visibility]
            );
            return result;
        } catch (error) {
            console.error("❌ Error en la creación del evento:", error);
            throw new Error("No se pudo crear el evento.");
        }
    }

    // 📌 Obtener eventos públicos
    static async getPublicEvents() {
        try {
            const [events] = await db.execute(
                'SELECT id, title, description, date, created_by FROM events WHERE visibility = "public" ORDER BY date DESC'
            );
            return events;
        } catch (error) {
            console.error("❌ Error al obtener eventos públicos:", error);
            throw new Error("No se pudieron obtener los eventos públicos.");
        }
    }

    // 📌 Obtener eventos creados por el usuario
    static async getUserEvents(user_id) {
        try {
            const [events] = await db.execute(
                'SELECT id, title, description, date, visibility FROM events WHERE created_by = ? ORDER BY date DESC',
                [user_id]
            );
            return events;
        } catch (error) {
            console.error("❌ Error al obtener eventos del usuario:", error);
            throw new Error("No se pudieron obtener los eventos del usuario.");
        }
    }

    // 📌 Eliminar un evento
    static async delete(id, user_id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM events WHERE id = ? AND created_by = ?',
                [id, user_id]
            );
            return result;
        } catch (error) {
            console.error("❌ Error al eliminar evento:", error);
            throw new Error("No se pudo eliminar el evento.");
        }
    }
}

module.exports = Event;
