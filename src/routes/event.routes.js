const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const {
    createEvent,
    getPublicEvents,
    getUserEvents,
    deleteEvent
} = require("../controllers/event.controller");

const router = express.Router();

// 📌 Middleware para manejo centralizado de errores async
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 📌 Crear un evento (requiere autenticación)
router.post("/", verifyToken, asyncHandler(createEvent));

// 📌 Obtener eventos públicos (sin autenticación)
router.get("/public", asyncHandler(getPublicEvents));

// 📌 Obtener eventos del usuario autenticado
router.get("/user", verifyToken, asyncHandler(getUserEvents));

// 📌 Eliminar un evento (requiere autenticación)
router.delete("/:id", verifyToken, asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "⚠️ ID de evento inválido." });
    }

    await deleteEvent(req, res);
}));

module.exports = router;
