import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    code: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
        },
        size: {
          type: String,
        },
        color: {
          type: String,
        },
      },
    ],
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    level: {
      type: String,
      enum: ["agency", "client"],
      default: "client",
    },
    aboutCode: {
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
userSchema.pre("save", async function (next) {
  if (this.isModified("role") || this.isNew) {
    const roleData = await mongoose.model("Role").findById(this.role).exec();
    if (roleData && this.commission === undefined) {
      this.commission = roleData.commission;
    }
  }
  next();
});

export default mongoose.model("User", userSchema);
