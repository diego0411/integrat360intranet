const supabase = require("../config/supabase");

exports.getDashboardData = async (req, res) => {
    try {
        // 📌 Obtener el total de eventos
        const { count: total_events, error: errorEvents } = await supabase
            .from("events")
            .select("*", { count: "exact", head: true });

        // 📌 Obtener el total de documentos
        const { count: total_documents, error: errorDocs } = await supabase
            .from("documents")
            .select("*", { count: "exact", head: true });

        // 📌 Obtener el total de carpetas
        const { count: total_folders, error: errorFolders } = await supabase
            .from("folders")
            .select("*", { count: "exact", head: true });

        // 📌 Verificar errores
        if (errorEvents || errorDocs || errorFolders) {
            throw errorEvents || errorDocs || errorFolders;
        }

        res.json({
            total_events,
            total_documents,
            total_folders,
        });
    } catch (error) {
        console.error("❌ Error en Dashboard:", error.message);
        res.status(500).json({ error: "Error interno en el dashboard" });
    }
};
