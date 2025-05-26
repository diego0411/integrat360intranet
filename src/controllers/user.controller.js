const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");

// 📌 Obtener todos los usuarios (Solo Admin)
exports.getUsers = async (req, res) => {
    try {
        console.log("📌 Iniciando consulta de usuarios...");
        const { data: users, error } = await supabase
            .from("users")
            .select("id, name, email, role, birthdate");

        if (error) throw error;

        console.log("✅ Usuarios obtenidos:", users);
        res.json(users);
    } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error interno al obtener usuarios" });
    }
};

// 📌 Registrar un usuario
exports.registerUser = async (req, res) => {
    const { name, email, password, role, birthdate } = req.body;
    console.log("📥 Datos recibidos:", req.body);

    if (!name || !email || !password || !birthdate) {
        return res.status(400).json({
            error: "⚠️ Todos los campos son obligatorios, incluyendo la fecha de nacimiento.",
        });
    }

    try {
        // Verificar si el usuario ya existe
        const { data: existingUser, error: userCheckError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single();

        if (existingUser) {
            return res.status(409).json({ error: "⚠️ El correo electrónico ya está registrado." });
        }

        if (userCheckError && userCheckError.code !== "PGRST116") {
            // "PGRST116" es "No rows found"
            throw userCheckError;
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario
        const { error } = await supabase
            .from("users")
            .insert([{ name, email, password: hashedPassword, role, birthdate }]);

        if (error) throw error;

        res.status(201).json({ message: "✅ Usuario registrado exitosamente" });
    } catch (error) {
        console.error("❌ Error al registrar usuario:", error.message);
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
        const { error } = await supabase
            .from("users")
            .update({ name, email, role, birthdate })
            .eq("id", id);

        if (error) throw error;

        res.json({ message: "✅ Usuario actualizado correctamente" });
    } catch (error) {
        console.error("❌ Error al actualizar usuario:", error.message);
        res.status(500).json({ error: "Error interno al actualizar usuario." });
    }
};

// 📌 Eliminar usuario
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase.from("users").delete().eq("id", id);

        if (error) throw error;

        res.json({ message: "✅ Usuario eliminado correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar usuario:", error.message);
        res.status(500).json({ error: "Error interno al eliminar usuario" });
    }
};

// 📌 Obtener usuarios con cumpleaños en un mes específico
exports.getBirthdayUsers = async (req, res) => {
    try {
        const { month } = req.query;

        const { data, error } = await supabase.rpc("get_birthdays_by_month", {
            month_input: parseInt(month),
        });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error("❌ Error al obtener cumpleaños:", error.message);
        res.status(500).json({ error: "Error interno al obtener cumpleaños." });
    }
};

// 📌 Obtener próximos cumpleaños (ordenados)
exports.getUpcomingBirthdays = async (req, res) => {
    try {
        const { data, error } = await supabase.rpc("get_upcoming_birthdays");

        if (error) throw error;

        res.json(data.length > 0 ? data : []);
    } catch (error) {
        console.error("❌ Error al obtener cumpleaños:", error.message);
        res.status(500).json({ error: "Error interno al obtener cumpleaños." });
    }
};
