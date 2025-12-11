const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    fileUrl: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    cloudinary_id: { type: String },
    isSpam: { type: Boolean, default: false },
    spamScore: { type: Number, default: 0 },
    markedAsSpamBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    markedAsNotSpamBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
