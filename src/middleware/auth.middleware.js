const jwt = require("jsonwebtoken");

// 📌 Middleware para verificar si el usuario está autenticado
exports.verifyToken = (req, res, next) => {
    let token = req.header("Authorization");

    if (!token) {
        return res.status(403).json({ error: "⛔ Acceso denegado, token requerido" });
    }

    try {
        token = token.replace("Bearer ", "").trim(); // 🔥 Limpia espacios adicionales
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;

        console.log("✅ Token verificado:", verified);
        next();
    } catch (error) {
        console.error("❌ Error de token:", error.message);
        res.status(401).json({ error: "⛔ Token inválido o expirado" });
    }
};

// 📌 Middleware para verificar si el usuario es administrador
exports.verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "⛔ Acceso denegado, se requiere rol de administrador" });
    }
    console.log("✅ Acceso de administrador autorizado");
    next();
};
