const supabase = require("../config/supabase");

class Notification {
    // 📌 Crear una notificación
    static async createNotification(user_id, title, message, type = "info") {
        const { data, error } = await supabase
            .from("notifications")
            .insert([{ user_id, title, message, type, read: false }])
            .select()
            .single();

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
            .select("id, title, message, type, read, created_at")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("❌ Error al obtener notificaciones:", error.message);
            throw new Error("No se pudieron obtener las notificaciones.");
        }

        return data;
    }

    // 📌 Marcar notificación como leída
    static async markAsRead(notification_id) {
        const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", notification_id);

        if (error) {
            console.error("❌ Error al marcar como leída:", error.message);
            throw new Error("No se pudo marcar la notificación como leída.");
        }
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
