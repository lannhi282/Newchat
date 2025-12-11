const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const cloudinary = require("../utils/cloudinary");
const spamClassifier = require("../utils/spamClassifier");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    // Tìm thời điểm user xóa lịch sử (nếu có)
    const userDeletedHistory = chat.deletedHistoryBy?.find(
      (item) => item.userId.toString() === req.user._id.toString()
    );

    const query = {
      chat: req.params.chatId,
    };

    // Nếu user đã xóa lịch sử, chỉ lấy tin nhắn sau thời điểm đó
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
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content || "",
    chat: chatId,
  };

  // Check for spam if content exists
  if (content && content.trim().length > 0) {
    const spamDetails = spamClassifier.getSpamDetails(content);
    newMessage.isSpam = spamDetails.isSpam;
    newMessage.spamScore = spamDetails.spamScore;
  }

  // Handle file upload if present
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "chat_files",
        resource_type: "auto",
      });

      newMessage.fileUrl = result.secure_url;
      newMessage.fileName = req.file.originalname;
      newMessage.fileType = req.file.mimetype;
      newMessage.cloudinary_id = result.public_id;
    } catch (uploadError) {
      res.status(400);
      throw new Error("File upload failed: " + uploadError.message);
    }
  }

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
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
    if (!message.markedAsSpamBy.includes(req.user._id)) {
      message.markedAsSpamBy.push(req.user._id);
    }

    // Remove from not spam list if exists
    message.markedAsNotSpamBy = message.markedAsNotSpamBy.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );

    await message.save();
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
    if (!message.markedAsNotSpamBy.includes(req.user._id)) {
      message.markedAsNotSpamBy.push(req.user._id);
    }

    // Remove from spam list if exists
    message.markedAsSpamBy = message.markedAsSpamBy.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );

    await message.save();
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
