const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Danh sách user đã ẩn chat (chỉ cho chat 1-1)
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // THÊM: Lưu thời điểm mỗi user xóa lịch sử
    deletedHistoryBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        deletedAt: { type: Date, default: Date.now },
      },
    ],

    // Đánh dấu spam cho từng user
    spamMarkedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        markedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;

// chatName
// isGroup
// users
// latrestUser
// groupAdmin
