import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: String,
    sizeInfo: [
      {
        size: String, // Đổi thành String nếu size có thể bao gồm không chỉ số
        defaultPrice: Number, // Giá mặc định
        retailPrice: Number, // Giá bán lẻ
        wholesalePrice: Number, // Giá bán buôn
      },
    ],
    colorInfo: [
      {
        color: String,
      },
    ],
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
