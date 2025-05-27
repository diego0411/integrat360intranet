const supabase = require("../config/supabase");

class Message {
    // 📩 Crear mensaje privado
    static async createPrivateMessage(sender_id, receiver_id, message) {
        const { data, error } = await supabase
            .from("messages")
            .insert([{ sender_id, receiver_id, message }])
            .select()
            .single();

        if (error) {
            console.error("❌ Error al guardar mensaje privado:", error.message);
            throw new Error("No se pudo guardar el mensaje privado.");
        }

        return data;
    }

    // 🟦 Crear mensaje grupal
    static async createGroupMessage(sender_id, group_id, message) {
        const { data, error } = await supabase
            .from("messages")
            .insert([{ sender_id, group_id, message }])
            .select()
            .single();

        if (error) {
            console.error("❌ Error al guardar mensaje grupal:", error.message);
            throw new Error("No se pudo guardar el mensaje grupal.");
        }

        return data;
    }

    // 🟨 Crear mensaje público
    static async createPublicMessage(sender_id, message) {
        const { data, error } = await supabase
            .from("messages")
            .insert([{ sender_id, message }])
            .select()
            .single();

        if (error) {
            console.error("❌ Error al guardar mensaje público:", error.message);
            throw new Error("No se pudo guardar el mensaje público.");
        }

        return data;
    }

    // 🔁 Obtener historial de mensajes privados
    static async getPrivateMessages(sender_id, receiver_id) {
        const { data, error } = await supabase
            .from("messages")
            .select(`
                id,
                message,
                created_at,
                sender:sender_id (id, name)
            `)
            .or(
                `and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`
            )
            .order("created_at", { ascending: true });

        if (error) {
            console.error("❌ Error al obtener mensajes privados:", error.message);
            throw new Error("No se pudo obtener el historial de mensajes.");
        }

        return data;
    }

    // 🔁 Obtener mensajes del grupo
    static async getGroupMessages(group_id) {
        const { data, error } = await supabase
            .from("messages")
            .select(`
                id,
                message,
                created_at,
                sender:sender_id (id, name)
            `)
            .eq("group_id", group_id)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("❌ Error al obtener mensajes del grupo:", error.message);
            throw new Error("No se pudo obtener los mensajes del grupo.");
        }

        return data;
    }

    // 🔁 Obtener mensajes públicos
    static async getPublicMessages() {
        const { data, error } = await supabase
            .from("messages")
            .select(`
                id,
                message,
                created_at,
                sender:sender_id (id, name)
            `)
            .is("receiver_id", null)
            .is("group_id", null)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("❌ Error al obtener mensajes públicos:", error.message);
            throw new Error("No se pudieron obtener los mensajes públicos.");
        }

        return data;
    }
}

module.exports = Message;
