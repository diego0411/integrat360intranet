const supabase = require("../config/supabase");

class Notification {
    // 📌 Crear una notificación
    static async createNotification(user_id, message, type = "info") {
        const { data, error } = await supabase
            .from("notifications")
            .insert([{ user_id, message, type }]);

        if (error) {
            console.error("❌ Error al crear notificación:", error.message);
            throw new Error("No se pudo crear la notificación.");
        }

        return data;
    }

    // 📌 Obtener notificaciones de un usuario
    static async getUserNotifications(user_id) {
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("❌ Error al obtener notificaciones:", error.message);
            throw new Error("No se pudieron obtener las notificaciones.");
        }

        return data;
    }

    // 📌 Eliminar una notificación
    static async deleteNotification(id, user_id) {
        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", id)
            .eq("user_id", user_id);

        if (error) {
            console.error("❌ Error al eliminar notificación:", error.message);
            throw new Error("No se pudo eliminar la notificación.");
        }

        return true;
    }
}

module.exports = Notification;
