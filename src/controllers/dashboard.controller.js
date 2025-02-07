const db = require("../config/db");

exports.getDashboardData = async (req, res) => {
    try {
        // Obtener el número total de eventos
        const [events] = await db.execute("SELECT COUNT(*) as total_events FROM events");

        // Obtener el número total de documentos
        const [documents] = await db.execute("SELECT COUNT(*) as total_documents FROM documents");

        // Obtener el número total de carpetas
        const [folders] = await db.execute("SELECT COUNT(*) as total_folders FROM folders");

        res.json({
            total_events: events[0].total_events,
            total_documents: documents[0].total_documents,
            total_folders: folders[0].total_folders,
        });
    } catch (error) {
        console.error("❌ Error en Dashboard:", error);
        res.status(500).json({ error: "Error interno en el dashboard" });
    }
};
