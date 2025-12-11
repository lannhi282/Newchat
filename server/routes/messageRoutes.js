const express = require("express");
const {
  allMessages,
  sendMessage,
  getSpamMessages,
  markAsSpam,
  markAsNotSpam,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, upload.single("file"), sendMessage);
router.route("/spam/:chatId").get(protect, getSpamMessages);
router.route("/mark-spam/:messageId").put(protect, markAsSpam);
router.route("/mark-not-spam/:messageId").put(protect, markAsNotSpam);

module.exports = router;
