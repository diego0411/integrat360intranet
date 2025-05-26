const supabase = require("../config/supabase");

class Event {
    // 📌 Crear un evento
    static async create(title, description, date, created_by, visibility) {
        const { data, error } = await supabase
            .from("events")
            .insert([{ title, description, date, created_by, visibility }]);

        if (error) {
            console.error("❌ Error en la creación del evento:", error.message);
            throw new Error("No se pudo crear el evento.");
        }

        return data;
    }

    // 📌 Obtener eventos públicos
    static async getPublicEvents() {
        const { data, error } = await supabase
            .from("events")
            .select("id, title, description, date, created_by")
            .eq("visibility", "public")
            .order("date", { ascending: false });

        if (error) {
            console.error("❌ Error al obtener eventos públicos:", error.message);
            throw new Error("No se pudieron obtener los eventos públicos.");
        }

        return data;
    }

    // 📌 Obtener eventos del usuario autenticado
    static async getUserEvents(user_id) {
        const { data, error } = await supabase
            .from("events")
            .select("id, title, description, date, visibility")
            .eq("created_by", user_id)
            .order("date", { ascending: false });

        if (error) {
            console.error("❌ Error al obtener eventos del usuario:", error.message);
            throw new Error("No se pudieron obtener los eventos del usuario.");
        }

        return data;
    }

    // 📌 Eliminar evento creado por el usuario
    static async delete(id, user_id) {
        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", id)
            .eq("created_by", user_id);

        if (error) {
            console.error("❌ Error al eliminar evento:", error.message);
            throw new Error("No se pudo eliminar el evento.");
        }

        return true;
    }
}

module.exports = Event;
