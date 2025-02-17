const bcrypt = require("bcryptjs");
const db = require("../config/db");

// 📌 Obtener todos los usuarios (Solo Admin)
exports.getUsers = async (req, res) => {
    try {
        console.log("📌 Iniciando consulta de usuarios...");
        const [users] = await db.execute("SELECT id, name, email, role, birthdate FROM users");

        console.log("✅ Usuarios obtenidos:", users);
        res.json(users);
    } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error interno al obtener usuarios" });
    }
};

// 📌 Registrar un usuario (con validación de datos)
exports.registerUser = async (req, res) => {
    const { name, email, password, role, birthdate } = req.body;
    console.log("📥 Datos recibidos:", req.body); // 📌 Depuración

    // ✅ Validar datos obligatorios
    if (!name || !email || !password || !birthdate) {
        return res.status(400).json({ error: "⚠️ Todos los campos son obligatorios, incluyendo la fecha de nacimiento." });
    }

    try {
        // 🔍 Verificar si el correo ya existe
        const [existingUser] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: "⚠️ El correo electrónico ya está registrado." });
        }

        // 🔒 Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 📝 Insertar usuario en la base de datos
        const [result] = await db.execute(
            "INSERT INTO users (name, email, password, role, birthdate) VALUES (?, ?, ?, ?, ?)",
            [name, email, hashedPassword, role, birthdate]
        );

        // ✅ Confirmar inserción
        if (result.affectedRows > 0) {
            res.status(201).json({ message: "✅ Usuario registrado exitosamente" });
        } else {
            throw new Error("No se pudo registrar el usuario.");
        }
    } catch (error) {
        console.error("❌ Error al registrar usuario:", error);
        res.status(500).json({ error: "Error interno al registrar usuario." });
    }
};

// 📌 Actualizar usuario
exports.updateUser = async (req, res) => {
    const { name, email, role, birthdate } = req.body;
    const { id } = req.params;

    if (!name || !email || !birthdate) {
        return res.status(400).json({ error: "⚠️ Nombre, correo y fecha de nacimiento son obligatorios" });
    }

    try {
        const [result] = await db.execute(
            "UPDATE users SET name = ?, email = ?, role = ?, birthdate = ? WHERE id = ?",
            [name, email, role, birthdate, id]
        );

        res.json({ message: "✅ Usuario actualizado correctamente" });
    } catch (error) {
        console.error("❌ Error al actualizar usuario:", error);
        res.status(500).json({ error: "Error interno al actualizar usuario." });
    }
};

// 📌 Eliminar usuario
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);

        if (result.affectedRows > 0) {
            res.json({ message: "✅ Usuario eliminado correctamente" });
        } else {
            res.status(404).json({ error: "⚠️ Usuario no encontrado." });
        }
    } catch (error) {
        console.error("❌ Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error interno al eliminar usuario" });
    }
};

// 📌 Obtener usuarios con cumpleaños hoy
// 📌 Obtener usuarios con cumpleaños hoy
exports.getBirthdayUsers = async (req, res) => {
    try {
        const { month } = req.query; // Recibir el mes desde el frontend
        const [users] = await db.execute(
            "SELECT id, name, email, birthdate FROM users WHERE MONTH(birthdate) = ?",
            [month]
        );

        res.json(users);
    } catch (error) {
        console.error("❌ Error al obtener cumpleaños:", error);
        res.status(500).json({ error: "Error interno al obtener cumpleaños." });
    }
};



// 📌 Obtener cumpleaños próximos
// 📌 Obtener cumpleaños próximos
exports.getUpcomingBirthdays = async (req, res) => {
    try {
        const [birthdays] = await db.execute(
            "SELECT id, name, email, DATE_FORMAT(birthdate, '%Y-%m-%d') AS birthdate FROM users ORDER BY MONTH(birthdate), DAY(birthdate) ASC"
        );

        // ✅ Enviar un array vacío en lugar de un error 404 si no hay cumpleaños
        res.json(birthdays.length > 0 ? birthdays : []);
    } catch (error) {
        console.error("❌ Error al obtener cumpleaños:", error);
        res.status(500).json({ error: "Error interno al obtener cumpleaños." });
    }
};

