import Product from "../models/Product";

const productController = {
  createProduct: async (req, res) => {
    try {
      const { name, description, sizes, colors } = req.body;
      const image = req.file ? req.file.path : "";

      // Xử lý sizeInfo
      let sizeInfo = sizes ? JSON.parse(sizes) : [];
      // Xử lý colorInfo
      let colorInfo = colors ? JSON.parse(colors) : [];
      colorInfo = colorInfo.map((color) => ({ color })); // Chuyển đổi thành đối tượng

      if (!name) {
        return res
          .status(400)
          .json({ message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc." });
      }

      const newProduct = new Product({
        name,
        image,
        sizeInfo,
        colorInfo,
        description,
      });

      await newProduct.save();

      res.status(201).json({
        message: "Product đã được tạo thành công",
        product: newProduct,
      });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, sizes, colors } = req.body;
      const image = req.file ? req.file.path : "";

      let sizeInfo = sizes ? JSON.parse(sizes) : [];
      let colorInfo = colors ? JSON.parse(colors) : [];
      colorInfo = colorInfo.map((color) => ({ color }));

      if (!name) {
        return res
          .status(400)
          .json({ message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc." });
      }

      const updatedProduct = {
        name,
        image,
        sizeInfo,
        colorInfo,
        description,
      };

      const product = await Product.findByIdAndUpdate(id, updatedProduct, {
        new: true,
      });

      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại." });
      }

      res.status(200).json({
        message: "Product đã được cập nhật thành công",
        product,
      });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },

  deleteProduct: async (req, res) => {
    const { id } = req.params;

    try {
      const deletedProduct = await Product.findByIdAndDelete(id);

      if (!deletedProduct) {
        return res.status(404).json({ message: "Product không tồn tại." });
      }

      res
        .status(200)
        .json({ message: "Product đã được xóa", product: deletedProduct });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },

  getProductById: async (req, res) => {
    const { id } = req.params;

    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Product không tồn tại." });
      }

      res.status(200).json({ product });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },

  getAllProducts: async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
      const products = await Product.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await Product.countDocuments();

      res.status(200).json({
        products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  },
};

export default productController;
