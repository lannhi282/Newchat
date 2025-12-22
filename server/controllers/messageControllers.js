const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const cloudinary = require("../utils/cloudinary");
const { checkSpam } = require("../utils/spamService");
const fs = require("fs");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    const userDeletedHistory = chat.deletedHistoryBy?.find(
      (item) => item.userId.toString() === req.user._id.toString()
    );

    const query = {
      chat: req.params.chatId,
    };

    if (userDeletedHistory) {
      query.createdAt = { $gt: userDeletedHistory.deletedAt };
    }

    const messages = await Message.find(query)
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if ((!content && !req.file) || !chatId) {
    console.log("❌ Missing content or chatId");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content || "",
    chat: chatId,
    isSpam: false,
    blocked: false,
  };

  // KIỂM TRA SPAM BẰNG PYTHON API
  if (content && content.trim().length > 0) {
    try {
      console.log("🔍 Checking spam for:", content.substring(0, 50));
      const spamResult = await checkSpam(content);
      console.log("📊 Spam check result:", spamResult);

      if (spamResult.isSpam) {
        newMessage.isSpam = true;
        newMessage.blocked = false;
        newMessage.spamScore = Math.round(spamResult.spamProbability * 100);
        console.log(
          "⚠️ SPAM DETECTED but message will be sent! Score:",
          newMessage.spamScore
        );
      } else {
        console.log("✅ Message is clean (not spam)");
      }
    } catch (error) {
      console.error("⚠️ Spam check failed, allowing message:", error.message);
    }
  }

  // XỬ LÝ FILE UPLOAD
  if (req.file) {
    try {
      console.log("📎 File received:", {
        name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
      });

      // Upload lên Cloudinary từ đường dẫn file
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "chat_files",
        resource_type: "auto",
      });

      console.log("☁️ Cloudinary upload success:", result.secure_url);

      newMessage.fileUrl = result.secure_url;
      newMessage.fileName = req.file.originalname;
      newMessage.fileType = req.file.mimetype;
      newMessage.cloudinary_id = result.public_id;

      // Xóa file tạm sau khi upload thành công
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("⚠️ Failed to delete temp file:", err);
        } else {
          console.log("🗑️ Temp file deleted:", req.file.path);
        }
      });
    } catch (uploadError) {
      console.error("❌ Cloudinary upload error:", uploadError);

      // Xóa file tạm nếu upload thất bại
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err)
            console.error("⚠️ Failed to delete temp file on error:", err);
        });
      }

      res.status(400);
      throw new Error("File upload failed: " + uploadError.message);
    }
  }

  try {
    // Lưu tin nhắn vào database
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Cập nhật latest message
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    console.log("✅ Message saved successfully:", message._id);

    res.json(message);
  } catch (error) {
    console.error("❌ Save message error:", error);
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Get spam messages for a chat
//@route           GET /api/Message/spam/:chatId
//@access          Protected
const getSpamMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
      isSpam: true,
    })
      .populate("sender", "name pic email")
      .populate("chat")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Mark message as spam
//@route           PUT /api/Message/mark-spam/:messageId
//@access          Protected
const markAsSpam = asyncHandler(async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      res.status(404);
      throw new Error("Message not found");
    }

    message.isSpam = true;
    message.blocked = false;

    if (!message.markedAsSpamBy.includes(req.user._id)) {
      message.markedAsSpamBy.push(req.user._id);
    }

    message.markedAsNotSpamBy = message.markedAsNotSpamBy.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );

    await message.save();

    console.log("✅ Message marked as spam:", message._id);
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Mark message as not spam
//@route           PUT /api/Message/mark-not-spam/:messageId
//@access          Protected
const markAsNotSpam = asyncHandler(async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      res.status(404);
      throw new Error("Message not found");
    }

    message.isSpam = false;
    message.blocked = false;

    if (!message.markedAsNotSpamBy.includes(req.user._id)) {
      message.markedAsNotSpamBy.push(req.user._id);
    }

    message.markedAsSpamBy = message.markedAsSpamBy.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );

    await message.save();

    console.log("✅ Message marked as not spam:", message._id);
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  allMessages,
  sendMessage,
  getSpamMessages,
  markAsSpam,
  markAsNotSpam,
};
