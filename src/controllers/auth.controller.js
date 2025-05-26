const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

// 📌 REGISTRAR USUARIO
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const { error: insertError } = await supabase
      .from("users")
      .insert([{ name, email, password: hashedPassword }]);

    if (insertError) throw insertError;

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("❌ Error en registro:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// 📌 INICIAR SESIÓN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// 📌 OBTENER USUARIO AUTENTICADO
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error en getMe:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};
