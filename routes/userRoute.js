import express from "express";
import userController from "../controllers/userController";

const router = express.Router();

router.post("/create", userController.createUser);
router.delete("/removecartitem", userController.removeProductFromCart);
router.get("/search", userController.searchUserByPhone);
router.put("/active-user/:userId", userController.activeUser);
router.put("/active-all", userController.activateAllUsers);
router.get("/get-referred-users/:userId", userController.getReferredUsers);
router.put("/reset-balance/:id", userController.resetBalance);
router.get("/with-balance", userController.getUserBalances);
router.put("/:id", userController.updateUser);
router.get("/", userController.getAllUsers);
router.delete("/:id", userController.deleteUser);
router.post("/login", userController.login);
router.get("/:id", userController.getUserById);
router.post("/addtocart", userController.addProductToCart);
router.patch("/updateAdmin/:id", userController.updateIsAdmin);

export default router;
