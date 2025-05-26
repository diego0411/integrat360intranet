const express = require("express");
const { getUpcomingBirthdays } = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// 📌 Ruta para obtener los cumpleaños próximos
router.get("/", verifyToken, (req, res) => getBirthdayUsers(req, res));


module.exports = router;
