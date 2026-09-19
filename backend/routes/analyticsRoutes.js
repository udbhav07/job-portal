const express = require("express");
const { getEmployerAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/overview", protect, getEmployerAnalytics);

module.exports = router;
