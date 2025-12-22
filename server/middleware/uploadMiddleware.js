const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Tạo folder uploads nếu chưa có
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ ĐỔI SANG DISK STORAGE - Lưu file vào disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Lưu vào folder uploads/
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique với timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images and documents are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
