const fs = require("fs");
const path = require("path");
const db = require("../config/db");

// 📤 Función para subir un documento
const uploadDocument = async (req, res) => {
    try {
        console.log("📥 Iniciando carga de documento...");
        console.log("📌 Body recibido:", req.body);
        console.log("📂 Archivo recibido:", req.file || "❌ Ningún archivo recibido");

        const folder_id = req.body.folder_id ? Number(req.body.folder_id) : null;
        const owner_id = req.user?.id || null;
        const file = req.file;

        if (!file) {
            console.error("❌ No se ha subido ningún archivo.");
            return res.status(400).json({ error: "⚠️ No se ha subido ningún archivo válido." });
        }

        if (!folder_id) {
            console.error("❌ No se ha especificado una carpeta válida.");
            return res.status(400).json({ error: "⚠️ Debes seleccionar una carpeta válida." });
        }

        console.log("📂 Carpeta ID:", folder_id);
        console.log("📄 Archivo nombre:", file.filename);

        const originalName = file.originalname || `documento_${Date.now()}`;
        const storedName = file.filename;
        const filePath = `uploads/${file.filename}`;

        const [result] = await db.execute(
            "INSERT INTO documents (name, folder_id, owner_id, url, original_name) VALUES (?, ?, ?, ?, ?)",
            [storedName, folder_id, owner_id, filePath, originalName]
        );

        console.log("✅ Documento guardado con ID:", result.insertId);
        res.status(201).json({ message: "✅ Documento subido exitosamente", documentId: result.insertId });

    } catch (error) {
        console.error("❌ Error al subir documento:", error);
        res.status(500).json({ error: "❌ Error interno al subir el documento." });
    }
};


// 📥 Función para descargar un documento
const downloadDocument = async (req, res) => {
    try {
        const { document_id } = req.params;

        // 📌 Buscar el documento en la base de datos
        const [documents] = await db.execute(
            "SELECT name, original_name, url FROM documents WHERE id = ?",
            [document_id]
        );

        if (documents.length === 0) {
            return res.status(404).json({ error: "⚠️ Documento no encontrado." });
        }

        const document = documents[0];
        const filePath = path.join(__dirname, "../../", document.url); // ✅ Ruta absoluta correcta

        console.log(`📥 Intentando descargar archivo desde: ${filePath}`);

        // 📌 Verificar si el archivo realmente existe antes de enviarlo
        if (!fs.existsSync(filePath)) {
            console.error("❌ El archivo no existe en:", filePath);
            return res.status(404).json({ error: "⚠️ Archivo no encontrado en el servidor." });
        }

        // 📥 Enviar archivo como descarga
        res.setHeader("Content-Disposition", `attachment; filename="${document.original_name}"`);
        res.setHeader("Content-Type", "application/octet-stream");

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error("❌ Error en la descarga:", error);
        res.status(500).json({ error: "❌ Error interno en la descarga." });
    }
};



// 📌 Compartir un documento con otro usuario o grupo
const shareDocument = async (req, res) => {
    try {
        const { document_id, user_id, group_id } = req.body;
        const owner_id = req.user.id; // Usuario que comparte el archivo

        if (!document_id || (!user_id && !group_id)) {
            return res.status(400).json({ error: "⚠️ Se debe especificar un usuario o grupo." });
        }

        console.log(`🔗 Compartiendo documento ${document_id} con ${user_id ? `usuario ${user_id}` : `grupo ${group_id}`}`);

        if (user_id) {
            await db.execute(
                "INSERT INTO shared_documents (document_id, shared_with_user, owner_id) VALUES (?, ?, ?)",
                [document_id, user_id, owner_id]
            );
        }

        if (group_id) {
            await db.execute(
                "INSERT INTO shared_documents (document_id, shared_with_group, owner_id) VALUES (?, ?, ?)",
                [document_id, group_id, owner_id]
            );
        }

        res.json({ message: "✅ Documento compartido correctamente." });

    } catch (error) {
        console.error("❌ Error al compartir documento:", error);
        res.status(500).json({ error: "❌ Error interno al compartir el documento." });
    }
};


// 📌 Asegurar que se exporta correctamente
module.exports = {
    uploadDocument, // ✅ Asegurar que está definido y exportado
    downloadDocument,
    shareDocument,
};
