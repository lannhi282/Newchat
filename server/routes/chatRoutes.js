const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
  deleteChat,
  leaveGroup,
  markAsSpam,
  markAsNotSpam,
  fetchSpamChats,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/").delete(protect, deleteChat);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/leavegroup").put(protect, leaveGroup);
router.route("/spam").put(protect, markAsSpam);
router.route("/notspam").put(protect, markAsNotSpam);
router.route("/spam").get(protect, fetchSpamChats);

module.exports = router;
