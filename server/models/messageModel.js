const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // File attachments
    fileUrl: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    cloudinary_id: { type: String },

    // Spam detection
    isSpam: { type: Boolean, default: false },
    spamScore: { type: Number, default: 0 },

    // ✅ THÊM FIELD NÀY
    blocked: { type: Boolean, default: false }, // Tin nhắn bị chặn (không gửi đến người nhận)

    markedAsSpamBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    markedAsNotSpamBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
