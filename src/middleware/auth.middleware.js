const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

// 📌 Verifica si el token JWT es válido
exports.verifyToken = async (req, res, next) => {
    let token = req.header("Authorization");

    if (!token) {
        return res.status(403).json({ error: "⛔ Acceso denegado, token requerido" });
    }

    try {
        token = token.replace("Bearer ", "").trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }

        console.log("✅ Token verificado:", decoded);
        next();
    } catch (error) {
        console.error("❌ Error de token:", error.message);
        res.status(401).json({ error: "⛔ Token inválido o expirado" });
    }
};

// 📌 Verifica si el usuario es administrador (consulta real desde Supabase)
exports.verifyAdmin = async (req, res, next) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: "⛔ Token no contiene ID de usuario" });
    }

    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: "⛔ Usuario no encontrado" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ error: "⛔ Acceso denegado, se requiere rol de administrador" });
        }

        console.log("✅ Acceso de administrador autorizado");
        next();
    } catch (error) {
        console.error("❌ Error al verificar rol de administrador:", error.message);
        res.status(500).json({ error: "❌ Error interno del servidor" });
    }
};
