import Role from "../models/Role";
import User from "../models/User";

const roleController = {
  createRole: async (req, res) => {
    const { name, commission } = req.body;

    if (!name || commission == null) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc." });
    }

    try {
      const newRole = new Role({
        name,
        commission,
      });

      await newRole.save();

      res
        .status(201)
        .json({ message: "Role đã được tạo thành công", role: newRole });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },
  updateRole: async (req, res) => {
    const { id } = req.params;
    const { name, commission } = req.body;

    try {
      const updatedRole = await Role.findByIdAndUpdate(
        id,
        { name, commission },
        { new: true }
      );

      if (!updatedRole) {
        return res.status(404).json({ message: "Role không tồn tại." });
      }

      // Cập nhật commission cho tất cả user có role tương ứng
      await User.updateMany({ role: id }, { $set: { commission } });

      res.status(200).json({
        message:
          "Role đã được cập nhật và commission của người dùng liên quan đã được cập nhật",
        role: updatedRole,
      });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },

  deleteRole: async (req, res) => {
    const { id } = req.params;

    try {
      const deletedRole = await Role.findByIdAndDelete(id);

      if (!deletedRole) {
        return res.status(404).json({ message: "Role không tồn tại." });
      }

      res.status(200).json({ message: "Role đã được xóa", role: deletedRole });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },

  getRoleById: async (req, res) => {
    const { id } = req.params;

    try {
      const role = await Role.findById(id);
      if (!role) {
        return res.status(404).json({ message: "Role không tồn tại." });
      }

      res.status(200).json({ role });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },

  getAllRoles: async (req, res) => {
    try {
      const roles = await Role.find();

      res.status(200).json({ roles });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },
};

export default roleController;
