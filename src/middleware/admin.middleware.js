const db = require("../config/db");

exports.verifyAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [user] = await db.execute("SELECT role FROM users WHERE id = ?", [userId]);

        if (user.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        if (user[0].role !== "admin") {
            return res.status(403).json({ error: "Acceso denegado. No tienes permisos de administrador" });
        }
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ error: "Acceso denegado, se requiere rol de administrador" });
        }

        next(); // ✅ Si es admin, continúa con la siguiente función
    } catch (error) {
        console.error("Error en la verificación de administrador:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
