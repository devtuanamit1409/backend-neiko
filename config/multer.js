import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Tạo một hash ngẫu nhiên
    const uniqueSuffix = `${Date.now()}-${crypto
      .randomBytes(8)
      .toString("hex")}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

export { upload };
