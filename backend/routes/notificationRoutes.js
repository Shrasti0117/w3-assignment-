const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getNotifications, markNotificationsAsRead } = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/read", protect, markNotificationsAsRead);

module.exports = router;