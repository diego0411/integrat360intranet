const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const { 
    createEvent, 
    getPublicEvents, 
    getUserEvents, 
    deleteEvent 
} = require("../controllers/event.controller");

const router = express.Router();

// 📌 Middleware de manejo de errores centralizado
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res)).catch(next);
};

// 📌 Crear un evento (Autenticación requerida)
router.post("/", verifyToken, asyncHandler(createEvent));

// 📌 Obtener eventos públicos (Acceso sin autenticación)
router.get("/public", asyncHandler(getPublicEvents));

// 📌 Obtener eventos del usuario autenticado
router.get("/user", verifyToken, asyncHandler(getUserEvents));

// 📌 Eliminar un evento (Solo el creador puede hacerlo)
router.delete("/:id", verifyToken, asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validar que el ID sea un número válido
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    await deleteEvent(req, res);
}));

module.exports = router;
