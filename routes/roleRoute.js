import express from "express";
import roleController from "../controllers/roleController";

const router = express.Router();

router.post("/create", roleController.createRole);
router.put("/:id", roleController.updateRole);
router.delete("/:id", roleController.deleteRole);
router.get("/", roleController.getAllRoles);
router.get("/:id", roleController.getRoleById);

export default router;
