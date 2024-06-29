import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    wholesaleprice: {
      type: Number,
      required: true,
    },
    images: [String],
    sizeInfo: [
      {
        size: Number,
        price: Number,
      },
    ],
    colorInfo: [
      {
        color: String,
        price: Number,
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
