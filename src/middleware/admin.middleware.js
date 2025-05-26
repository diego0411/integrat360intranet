const supabase = require("../config/supabase");

exports.verifyAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // ✅ Verificar que el usuario existe y tiene rol "admin"
        const { data: user, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador" });
        }

        next(); // ✅ Usuario autorizado
    } catch (error) {
        console.error("❌ Error en la verificación de administrador:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
