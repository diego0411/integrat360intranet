const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const { verifyAdmin } = require("../middleware/admin.middleware");
const {
    getUsers,
    registerUser,
    updateUser,
    deleteUser,
    getBirthdayUsers,
    getUpcomingBirthdays
} = require("../controllers/user.controller");

const router = express.Router();

// 📌 Usuarios (solo admin)
router.get("/", verifyToken, verifyAdmin, getUsers);
router.post("/register", registerUser);
router.put("/:id", verifyToken, verifyAdmin, updateUser);
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);

// 📌 Cumpleaños
router.get("/birthdays/today", verifyToken, getBirthdayUsers);
router.get("/birthdays/upcoming", verifyToken, getUpcomingBirthdays);

module.exports = router;
