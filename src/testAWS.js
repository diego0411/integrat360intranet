require("dotenv").config();
const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function checkS3Connection() {
    try {
        const data = await s3.send(new ListBucketsCommand({}));
        console.log("✅ Conexión exitosa con S3. Buckets disponibles:", data.Buckets);
    } catch (error) {
        console.error("❌ Error al conectar con S3:", error);
    }
}

checkS3Connection();
