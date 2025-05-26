const express = require("express");
const { getBirthdayUsers, getUpcomingBirthdays } = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// 📌 Ruta para obtener cumpleaños filtrados por mes (ej: ?month=5)
router.get("/", verifyToken, getBirthdayUsers);

// 📌 Ruta para obtener todos los cumpleaños próximos
router.get("/upcoming", verifyToken, getUpcomingBirthdays);

module.exports = router;
