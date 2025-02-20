require("dotenv").config();
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const db = require("../config/db");

// 📌 Verificación de configuración de AWS antes de inicializar
const requiredEnvVars = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_S3_BUCKET"];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.error(`❌ ERROR: Falta la variable de entorno ${varName}`);
        process.exit(1);
    }
});

// 📌 Configurar cliente AWS S3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// 📌 Configurar `multer` para manejar archivos antes de subirlos a S3
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 📌 Limitar tamaño a 20MB
});

// 📤 **Subir un documento a S3**
const uploadDocument = async (req, res) => {
    try {
        console.log("📥 Iniciando carga de documento...");
        console.log("📂 Datos recibidos:", req.body);
        console.log("📎 Archivo recibido:", req.file ? req.file.originalname : "❌ Ningún archivo recibido");

        if (!req.file) {
            console.error("❌ No se recibió ningún archivo.");
            return res.status(400).json({ error: "⚠️ No se ha subido ningún archivo." });
        }

        const folder_id = req.body.folder_id ? Number(req.body.folder_id) : null;
        const owner_id = req.user?.id || null;

        if (!folder_id) {
            console.error("❌ No se especificó la carpeta destino.");
            return res.status(400).json({ error: "⚠️ Debes seleccionar una carpeta válida." });
        }

        // 📌 Nombre único para el archivo en S3 (sin espacios)
        const sanitizedFilename = req.file.originalname.replace(/\s+/g, "_");
        const storedName = `documents/${Date.now()}_${sanitizedFilename}`;

        // 📌 Configurar parámetros de subida a S3
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: storedName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        };

        try {
            await s3.send(new PutObjectCommand(uploadParams));
        } catch (s3Error) {
            console.error("❌ Error al subir archivo a S3:", s3Error);
            return res.status(500).json({ error: "❌ No se pudo subir el archivo a S3." });
        }

        // 📌 URL del archivo en S3 (requiere que el bucket tenga acceso público)
        const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${storedName}`;

        // 📌 Guardar en la base de datos
        try {
            const [result] = await db.execute(
                "INSERT INTO documents (name, folder_id, owner_id, url, original_name) VALUES (?, ?, ?, ?, ?)",
                [storedName, folder_id, owner_id, fileUrl, req.file.originalname]
            );

            console.log("✅ Documento guardado con ID:", result.insertId);
            res.status(201).json({
                message: "✅ Documento subido exitosamente",
                documentId: result.insertId,
                url: fileUrl
            });

        } catch (dbError) {
            console.error("❌ Error al guardar en la base de datos:", dbError);
            return res.status(500).json({ error: "❌ Error interno al guardar el documento." });
        }

    } catch (error) {
        console.error("❌ Error general en la subida de documento:", error);
        res.status(500).json({ error: "❌ Error interno en la subida del documento." });
    }
};

// 📥 **Obtener la URL de descarga de un documento**
const downloadDocument = async (req, res) => {
    try {
        const { document_id } = req.params;

        const [documents] = await db.execute(
            "SELECT name, original_name, url FROM documents WHERE id = ?",
            [document_id]
        );

        if (documents.length === 0) {
            return res.status(404).json({ error: "⚠️ Documento no encontrado." });
        }

        res.json({ downloadUrl: documents[0].url });

    } catch (error) {
        console.error("❌ Error en la descarga:", error);
        res.status(500).json({ error: "❌ Error interno en la descarga." });
    }
};

// 📌 **Compartir un documento con usuario o grupo**
const shareDocument = async (req, res) => {
    try {
        const { document_id, user_id, group_id } = req.body;
        const owner_id = req.user?.id || null;

        if (!document_id || (!user_id && !group_id)) {
            return res.status(400).json({ error: "⚠️ Se debe especificar un usuario o grupo." });
        }

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

// 📌 **Eliminar un documento (también de S3)**
const deleteDocument = async (req, res) => {
    try {
        const { document_id } = req.params;

        const [documents] = await db.execute(
            "SELECT name, url FROM documents WHERE id = ?",
            [document_id]
        );

        if (documents.length === 0) {
            return res.status(404).json({ error: "⚠️ Documento no encontrado." });
        }

        const document = documents[0];

        // 📌 Parámetros para eliminar de S3
        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: document.name,
        };

        try {
            await s3.send(new DeleteObjectCommand(deleteParams));
        } catch (s3Error) {
            console.error("❌ Error al eliminar archivo de S3:", s3Error);
            return res.status(500).json({ error: "❌ No se pudo eliminar el archivo de S3." });
        }

        // 📌 Eliminar referencia en la base de datos
        await db.execute("DELETE FROM documents WHERE id = ?", [document_id]);

        res.json({ message: "✅ Documento eliminado correctamente." });

    } catch (error) {
        console.error("❌ Error al eliminar documento:", error);
        res.status(500).json({ error: "❌ Error interno al eliminar el documento." });
    }
};

// 📌 **Exportar funciones**
module.exports = {
    uploadDocument,
    downloadDocument,
    shareDocument,
    deleteDocument,
    upload,
};
