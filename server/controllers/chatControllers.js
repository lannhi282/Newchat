const asyncHandler = require("express-async-handler");
const { remove } = require("../models/chatModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    // console.log("UserId param not sent with request");
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
    Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
      // Chỉ loại trừ chat 1-1 đã bị ẩn
      deletedBy: { $ne: req.user._id },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  // console.log(req);
  // console.log(req.body.name, req.body.users);
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);
  // console.log(users);

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
    // console.log(error);
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

    if (chat.isGroupChat) {
      // ===== NHÓM: Xóa lịch sử tin nhắn =====
      await Chat.findByIdAndUpdate(chatId, {
        $addToSet: {
          deletedHistoryBy: {
            userId: req.user._id,
            deletedAt: new Date(),
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "Chat history cleared. You will still receive new messages.",
        chatId: chatId,
        type: "history_cleared",
      });
    } else {
      // ===== CHAT 1-1: Ẩn chat =====
      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $addToSet: { deletedBy: req.user._id },
        },
        { new: true }
      );

      // Nếu cả 2 người đều xóa → xóa hẳn khỏi DB
      if (updatedChat.deletedBy.length === updatedChat.users.length) {
        await Chat.findByIdAndDelete(chatId);
      }

      res.status(200).json({
        success: true,
        message: "Chat deleted successfully",
        chatId: chatId,
        type: "chat_deleted",
      });
    }
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
