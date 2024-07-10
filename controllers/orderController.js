import Order from "../models/Order";
import User from "../models/User";
import Role from "../models/Role";
import Product from "../models/Product";
import TelegramBot from "node-telegram-bot-api";

const token = "6995195293:AAF8WgiSRD6mQaZRXCse8rTVn8-rjxiYrGs";
const bot = new TelegramBot(token, { polling: true });
const chatId = "-4237302244";

const orderController = {
  createOrder: async (req, res) => {
    try {
      const {
        user: userId,
        orderItems,
        shippingAddress,
        paymentMethod,
        referrerCode,
        phone,
        name,
        note,
      } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const order = new Order({
        user: userId,
        orderItems,
        shippingAddress,
        paymentMethod,
        referrerCode,
        phone,
        name,
        note,
      });

      let totalPrice = 0;
      let messageDetails = [];
      let referrerMessage = "🚫 Không có người giới thiệu"; // Emoji cho không có người giới thiệu

      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) continue;

        const sizeDetail = product.sizeInfo.find((si) => si.size === item.size);
        const colorDetail = product.colorInfo.find(
          (ci) => ci.color === item.color
        );
        if (!sizeDetail) continue;

        const price =
          user.level === "agency"
            ? sizeDetail.wholesalePrice
            : sizeDetail.retailPrice;
        totalPrice += price * item.qty;
        messageDetails.push(
          `📦 ${product.name} - Mã: ${item.size}, Số lượng: ${
            item.qty
          }, Đơn giá: ${price.toLocaleString("vi-VN")}₫, Tổng: ${(
            price * item.qty
          ).toLocaleString("vi-VN")}₫`
        );
      }

      order.totalPrice = totalPrice;

      if (referrerCode) {
        const referrerUser = await User.findOne({ code: referrerCode });
        if (referrerUser) {
          const commissionValue = (totalPrice * referrerUser.commission) / 100;
          referrerUser.balance += commissionValue;
          await referrerUser.save();
          order.commission = commissionValue; // Gán giá trị commission vào order
          referrerMessage = `💼 Người giới thiệu: ${referrerUser.name} `;
        }
      }

      const savedOrder = await order.save();

      const message = `🎉 Đơn hàng mới được tạo!\n👤 Khách hàng: ${
        user.name
      }\n📞 Điện thoại: ${phone}\n📝 Ghi chú: ${note}\n📜 Sản phẩm:\n${messageDetails.join(
        "\n"
      )}\n💰 Tổng giá trị đơn hàng: ${totalPrice.toLocaleString(
        "vi-VN"
      )}₫\n🏠 Địa chỉ giao hàng: ${shippingAddress}\n💳 Phương thức thanh toán: ${paymentMethod}\n${referrerMessage}`;
      bot.sendMessage(chatId, message);
      user.cart = [];
      await user.save();

      res.status(201).json(savedOrder);
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      res.status(400).json({ error: error.message });
    }
  },
  getOrdersByUserId: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo mới nhất
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await Order.countDocuments({ user: userId });

      res.status(200).json({
        orders,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      res.status(400).json({ error: error.message });
    }
  },
  getAllOrders: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const orders = await Order.find()
        .populate("orderItems.product")
        .populate("user")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await Order.countDocuments();

      res.status(200).json({
        orders,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      res.status(400).json({ error: error.message });
    }
  },
  deleteOrder: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedOrder = await Order.findByIdAndDelete(id);
      if (!deletedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", error);
      res.status(400).json({ error: error.message });
    }
  },
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isDelivered } = req.body;

      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { isDelivered },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);
      res.status(400).json({ error: error.message });
    }
  },
};

export default orderController;
