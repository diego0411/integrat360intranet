const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const { getDashboardData } = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/", verifyToken, getDashboardData);

module.exports = router;
