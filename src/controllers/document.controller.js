const fs = require("fs");
const path = require("path");
const db = require("../config/db");

// 📌 Subir un documento
exports.uploadDocument = async (req, res) => {
    const { folder_id } = req.body;
    const user_id = req.user?.id;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "No se ha subido ningún archivo" });
    }

    // 📌 Asegurar que el nombre original se guarde correctamente
    const originalName = file.originalname || `documento_${Date.now()}`;

    console.log("📂 Archivo recibido:", file);
    console.log("📌 Nombre original:", originalName);

    try {
        const [result] = await db.execute(
            "INSERT INTO documents (filename, original_name, folder_id, user_id) VALUES (?, ?, ?, ?)",
            [file.filename, originalName, folder_id, user_id]
        );

        console.log("✅ Documento guardado con ID:", result.insertId);

        res.status(201).json({ 
            message: "Documento subido exitosamente", 
            filename: originalName 
        });
    } catch (error) {
        console.error("❌ Error al subir documento:", error);
        res.status(500).json({ error: "Error interno al subir el documento" });
    }
};

// 📌 Obtener documentos de una carpeta
exports.getFolderDocuments = async (req, res) => {
    const { folder_id } = req.params;

    try {
        const [documents] = await db.execute(
            "SELECT id, filename, original_name FROM documents WHERE folder_id = ?",
            [folder_id]
        );

        res.json(documents);
    } catch (error) {
        console.error("❌ Error al obtener documentos:", error);
        res.status(500).json({ error: "Error interno al obtener los documentos" });
    }
};

// 📌 Eliminar un documento
exports.deleteDocument = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.user.id;

        console.log("🗑️ Intentando eliminar documento con ID:", documentId);

        // 🔍 Buscar el documento en la base de datos
        const [doc] = await db.execute("SELECT * FROM documents WHERE id = ?", [documentId]);

        if (doc.length === 0) {
            console.error("⚠️ Documento no encontrado en la base de datos.");
            return res.status(404).json({ error: "Documento no encontrado" });
        }

        console.log("📄 Documento encontrado:", doc[0]);

        // 🔒 Validar si el usuario tiene permiso para eliminarlo
        if (doc[0].user_id !== userId) {
            console.error("⛔ Usuario no autorizado para eliminar este documento.");
            return res.status(403).json({ error: "No tienes permiso para eliminar este archivo" });
        }

        // 📂 Verificar que la ruta apunta a un archivo válido
        const filePath = path.join(__dirname, "../../uploads", doc[0].filename);

        if (!doc[0].filename) {
            console.error("⚠️ El archivo no tiene un nombre válido en la base de datos.");
            return res.status(400).json({ error: "El archivo no tiene un nombre válido." });
        }

        console.log("📂 Ruta del archivo a eliminar:", filePath);

        // 📌 Verificar si el archivo existe antes de eliminarlo
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("✅ Archivo eliminado del sistema.");
        } else {
            console.warn("⚠️ El archivo no existe en el sistema de archivos.");
        }

        // 🗑️ Eliminar de la base de datos
        await db.execute("DELETE FROM documents WHERE id = ?", [documentId]);
        console.log("✅ Documento eliminado de la base de datos.");

        res.json({ message: "Documento eliminado correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar documento:", error);
        res.status(500).json({ error: "Error interno al eliminar el documento" });
    }
};
