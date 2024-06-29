import multer from "multer";
import path from "path";
import crypto from "crypto"; // Import thêm module crypto để tạo hash

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu trữ tệp tải lên
  },
  filename: (req, file, cb) => {
    // Tạo một hash ngẫu nhiên
    const uniqueSuffix = `${Date.now()}-${crypto
      .randomBytes(8)
      .toString("hex")}`;
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Thêm Date.now() và hash để đảm bảo tên file là duy nhất
  },
});

const upload = multer({ storage: storage });

export { upload };
