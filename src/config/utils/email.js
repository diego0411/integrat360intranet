const nodemailer = require("nodemailer");  

// 📌 Configurar el transporte de nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",  // O usa otro proveedor
    auth: {
        user: process.env.EMAIL_USER,  // Definir en .env
        pass: process.env.EMAIL_PASS,  // Definir en .env
    },
});

/**
 * 📌 Enviar correo de notificación de evento
 * @param {string} email - Correo del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} message - Cuerpo del correo
 */
const sendEmail = async (email, subject, message) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: message,
            html: `<p>${message}</p>`,
        });

        console.log(`📧 Correo enviado a ${email}`);
    } catch (error) {
        console.error("❌ Error al enviar correo:", error);
    }
};

module.exports = sendEmail;
