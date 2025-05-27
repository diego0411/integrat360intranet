const supabase = require("../config/supabase");

class Chat {
    // 📌 Guardar mensaje (privado o grupal)
    static async saveMessage(sender_id, receiver_id, group_id, message) {
        const { data, error } = await supabase
            .from("messages")
            .insert([{
                sender_id,
                receiver_id: receiver_id || null,
                group_id: group_id || null,
                message
            }])
            .select()
            .single();

        if (error) {
            console.error("❌ Error al guardar mensaje:", error.message);
            throw new Error("No se pudo guardar el mensaje.");
        }

        return data;
    }

    // 📌 Crear mensaje público (sin grupo ni receptor)
    static async createPublicMessage(sender_id, message) {
        const { data, error } = await supabase
            .from("messages")
            .insert([{ sender_id, message }])
            .select()
            .single();

        if (error) {
            console.error("❌ Error al crear mensaje público:", error.message);
            throw new Error("No se pudo guardar el mensaje público.");
        }

        return data;
    }

    // 📌 Crear mensaje privado directo
    static async createPrivateMessage(sender_id, receiver_id, message) {
        const { data, error } = await supabase
            .from("messages")
            .insert([{ sender_id, receiver_id, message }])
            .select()
            .single();

        if (error) {
            console.error("❌ Error al crear mensaje privado:", error.message);
            throw new Error("No se pudo guardar el mensaje privado.");
        }

        return data;
    }

    // 📌 Obtener mensajes públicos
    static async getPublicMessages() {
        const { data, error } = await supabase
            .from("messages")
            .select(`
                id,
                message,
                created_at,
                sender:sender_id (
                    id,
                    name
                )
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

    // 📌 Obtener mensajes privados entre dos usuarios
    static async getPrivateMessages(sender_id, receiver_id) {
        const { data, error } = await supabase
            .from("messages")
            .select(`
                id,
                message,
                created_at,
                sender:sender_id (
                    id,
                    name
                )
            `)
            .or(
                `and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`
            )
            .order("created_at", { ascending: true });

        if (error) {
            console.error("❌ Error al obtener mensajes privados:", error.message);
            throw new Error("No se pudieron obtener los mensajes privados.");
        }

        return data;
    }

    // 📌 Obtener mensajes de grupo
    static async getGroupMessages(group_id) {
        const { data, error } = await supabase
            .from("messages")
            .select(`
                id,
                message,
                created_at,
                sender:sender_id (
                    id,
                    name
                )
            `)
            .eq("group_id", group_id)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("❌ Error al obtener mensajes de grupo:", error.message);
            throw new Error("No se pudieron obtener los mensajes del grupo.");
        }

        return data;
    }
}

module.exports = Chat;
