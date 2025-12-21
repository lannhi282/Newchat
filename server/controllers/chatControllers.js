const asyncHandler = require("express-async-handler");
const { remove } = require("../models/chatModel");
const Chat = require("../models/chatModel");
const { checkSpam } = require("../utils/spamService");
const User = require("../models/userModel");
const Message = require("../models/messageModel"); // ✅ Thêm import Message model

//@desFcription     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    // ✅ QUAN TRỌNG: Luôn populate users đầy đủ
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password") // ✅ Đảm bảo users được populate
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    // ✅ Populate sender của latestMessage (nếu có)
    const results = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    // ✅ Filter bỏ chats không hợp lệ trước khi gửi về frontend
    const validChats = results.filter((chat) => {
      // Đảm bảo chat có users array hợp lệ
      if (!chat.users || chat.users.length === 0) {
        console.warn(`Invalid chat detected: ${chat._id} - Missing users`);
        return false;
      }
      // Chat 1-1 phải có đúng 2 users
      if (!chat.isGroupChat && chat.users.length !== 2) {
        console.warn(
          `Invalid 1-1 chat: ${chat._id} - ${chat.users.length} users`
        );
        return false;
      }
      return true;
    });

    res.status(200).send(validChats);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("chat Not Found");
  } else {
    res.json(added);
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("chat Not Found");
  } else {
    res.json(removed);
  }
});

// ✅ FIXED: Chỉ xóa NỘI DUNG tin nhắn, KHÔNG xóa user
const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    res.status(400);
    throw new Error("Chat ID is required");
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    // Kiểm tra xem user có trong chat không
    if (!chat.users.includes(req.user._id)) {
      res.status(403);
      throw new Error("You are not part of this chat");
    }

    // ✅ XÓA TẤT CẢ TIN NHẮN trong chat này
    await Message.deleteMany({ chat: chatId });

    // ✅ RESET latestMessage về null
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: null,
    });

    res.status(200).json({
      success: true,
      message: "All messages deleted successfully. Chat remains in your list.",
      chatId: chatId,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const leaveGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    res.status(400);
    throw new Error("Chat ID is required");
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    if (!chat.isGroupChat) {
      res.status(400);
      throw new Error("This is not a group chat");
    }

    // Kiểm tra xem user có trong nhóm không
    if (!chat.users.includes(req.user._id)) {
      res.status(403);
      throw new Error("You are not part of this group");
    }

    // Kiểm tra số lượng thành viên
    if (chat.users.length <= 3) {
      res.status(400);
      throw new Error("Cannot leave group with less than 3 members remaining");
    }

    // Xóa user khỏi nhóm
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: req.user._id },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // Nếu admin rời nhóm, chuyển quyền admin cho người khác
    if (chat.groupAdmin.toString() === req.user._id.toString()) {
      const newAdmin = updatedChat.users[0]._id;
      await Chat.findByIdAndUpdate(chatId, {
        groupAdmin: newAdmin,
      });
    }

    res.status(200).json({
      success: true,
      message: "You have left the group",
      chatId: chatId,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  deleteChat,
  leaveGroup,
};
