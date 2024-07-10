import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        qty: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        color: {
          type: String,
        },
      },
    ],
    shippingAddress: {
      type: String,
    },
    phone: {
      type: String,
    },
    name: {
      type: String,
    },
    note: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },

    totalPrice: {
      type: Number,
      default: 0.0,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    referrerCode: {
      type: String,
    },
    commission: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
