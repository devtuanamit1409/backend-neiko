import express from "express";
import productController from "../controllers/productController";
import { upload } from "../config/multer";

const router = express.Router();

router.post("/create", upload.single("image"), productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.delete("/:id", productController.deleteProduct);
router.put("/:id", upload.single("image"), productController.updateProduct);

export default router;
