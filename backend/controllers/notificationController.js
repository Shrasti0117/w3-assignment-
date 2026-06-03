const Notification = require("../models/Notification");

const notificationPopulate = [
  { path: "actorId", select: "username email" },
  { path: "postId", select: "text image createdAt" },
];

async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate(notificationPopulate);

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
}

async function markNotificationsAsRead(req, res, next) {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "Notifications marked as read." });
  } catch (error) {
    next(error);
  }
}

module.exports = { getNotifications, markNotificationsAsRead };