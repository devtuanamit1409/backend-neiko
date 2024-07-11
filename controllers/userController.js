import User from "../models/User";
import Role from "../models/Role";
import bcrypt from "bcryptjs";
import Product from "../models/Product";
import Order from "../models/Order";
import moment from "moment";
const generateRandomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const userController = {
  createUser: async (req, res) => {
    const { username, name, password, aboutCode, commission, phone, address } =
      req.body;

    if (!username || !name || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc." });
    }

    try {
      const defaultRole = await Role.findOne({});
      if (!defaultRole) {
        return res
          .status(400)
          .json({ message: "Không có Role hợp lệ nào trong hệ thống." });
      }

      if (aboutCode) {
        const aboutCodeExists = await User.findOne({ code: aboutCode });
        if (!aboutCodeExists) {
          return res.status(400).json({
            message: "aboutCode không khớp với bất kỳ người dùng nào.",
          });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 12); // Mã hóa mật khẩu

      const code = generateRandomCode();

      const newUser = new User({
        username,
        name,
        password: hashedPassword, // Sử dụng mật khẩu đã mã hóa
        code,
        role: defaultRole._id,
        aboutCode,
        commission,
        phone,
        address,
      });

      await newUser.save();

      res
        .status(201)
        .json({ message: "User đã được tạo thành công", user: newUser });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const { level, commission, balance } = req.body;

    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User không tồn tại." });
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          level,
          commission,
          balance,
        },
        { new: true }
      );

      res
        .status(200)
        .json({ message: "User đã được cập nhật", user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },
  deleteUser: async (req, res) => {
    const { id } = req.params;

    try {
      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return res.status(404).json({ message: "User không tồn tại." });
      }

      res.status(200).json({ message: "User đã được xóa", user: deletedUser });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },

  getUserById: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await User.findById(id)
        .populate("role")
        .populate("cart.product");
      if (!user) {
        return res.status(404).json({ message: "User không tồn tại." });
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },

  getAllUsers: async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
      const users = await User.find()
        .populate("role")
        .populate("cart.product")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await User.countDocuments();

      res.status(200).json({
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },

  resetBalance: async (req, res) => {
    const { id } = req.params;

    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { balance: 0 },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User không tồn tại." });
      }

      res
        .status(200)
        .json({ message: "Balance của user đã được reset", user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },
  login: async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập tên tài khoản và mật khẩu." });
    }

    try {
      const user = await User.findOne({ username }).populate("role");

      if (!user) {
        return res
          .status(400)
          .json({ message: "Tên tài khoản hoặc mật khẩu không chính xác." });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Tên tài khoản hoặc mật khẩu không chính xác." });
      }

      res.status(200).json({ message: "Đăng nhập thành công", user });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },
  addProductToCart: async (req, res) => {
    const { userId, productId, quantity, size, color } = req.body;

    if (!userId || !productId || !quantity || !size) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc.",
      });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User không tồn tại." });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại." });
      }

      const cartProductIndex = user.cart.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.size === size &&
          item.color === color
      );

      if (cartProductIndex >= 0) {
        user.cart[cartProductIndex].quantity += quantity;
      } else {
        user.cart.push({
          product: productId,
          quantity,
          size,
          color,
        });
      }

      await user.save();

      res.status(200).json({
        message: "Sản phẩm đã được thêm vào giỏ hàng",
        cart: user.cart,
      });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },
  removeProductFromCart: async (req, res) => {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc.",
      });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User không tồn tại." });
      }

      const updatedCart = user.cart.filter(
        (item) => item._id.toString() !== itemId
      );
      user.cart = updatedCart;

      await user.save();

      res.status(200).json({
        message: "Sản phẩm đã được xóa khỏi giỏ hàng",
        cart: user.cart,
      });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },
  getUserBalances: async (req, res) => {
    try {
      const { page = 1, limit = 10, startDate, endDate } = req.query;

      const start = moment(startDate, "DD/MM/YYYY").startOf("day").toDate();
      const end = moment(endDate, "DD/MM/YYYY").endOf("day").toDate();

      const users = await User.find()
        .select("name code")
        .skip((page - 1) * limit)
        .limit(limit);

      const userBalances = await Promise.all(
        users.map(async (user) => {
          const orders = await Order.find({
            referrerCode: user.code,
            createdAt: { $gte: start, $lte: end },
          });

          const totalCommission = orders.reduce(
            (sum, order) => sum + order.commission,
            0
          );

          return {
            name: user.name,
            totalCommission,
          };
        })
      );

      const count = await User.countDocuments();

      res.status(200).json({
        users: userBalances,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error("Lỗi khi lấy số dư người dùng:", error);
      res.status(500).json({ error: error.message });
    }
  },
  updateIsAdmin: async (req, res) => {
    const { id } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== "boolean") {
      return res
        .status(400)
        .json({ message: "Giá trị của isAdmin phải là boolean." });
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { isAdmin },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User không tồn tại." });
      }

      res
        .status(200)
        .json({ message: "User đã được cập nhật", user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },
};

export default userController;
