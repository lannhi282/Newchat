const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.route("/").post(protect, upload.single("file"), sendMessage);
router.route("/:chatId").get(protect, allMessages);

module.exports = router;
