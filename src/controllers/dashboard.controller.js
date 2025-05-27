const supabase = require("../config/supabase");

exports.getDashboardData = async (req, res) => {
    try {
        // 📌 Obtener conteo total de eventos
        const { count: total_events, error: errorEvents } = await supabase
            .from("events")
            .select("*", { count: "exact", head: true });

        // 📌 Obtener conteo total de documentos
        const { count: total_documents, error: errorDocs } = await supabase
            .from("documents")
            .select("*", { count: "exact", head: true });

        // 📌 Obtener conteo total de carpetas
        const { count: total_folders, error: errorFolders } = await supabase
            .from("folders")
            .select("*", { count: "exact", head: true });

        // 📌 Manejo de errores individuales
        if (errorEvents) throw new Error(`Eventos: ${errorEvents.message}`);
        if (errorDocs) throw new Error(`Documentos: ${errorDocs.message}`);
        if (errorFolders) throw new Error(`Carpetas: ${errorFolders.message}`);

        // 📌 Respuesta con resumen
        res.json({
            total_events: total_events ?? 0,
            total_documents: total_documents ?? 0,
            total_folders: total_folders ?? 0,
        });

    } catch (error) {
        console.error("❌ Error al cargar el Dashboard:", error.message);
        res.status(500).json({ error: "❌ Error interno al cargar los datos del Dashboard." });
    }
};
