import express from "express";
import orderController from "../controllers/orderController";

const router = express.Router();

router.post("/create", orderController.createOrder);
router.get("/:userId", orderController.getOrdersByUserId);
router.get("/", orderController.getAllOrders);
router.delete("/:id", orderController.deleteOrder);
router.put("/:id", orderController.updateOrderStatus);

export default router;
