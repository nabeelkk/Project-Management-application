import express from "express";
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
} from "../controllers/cartController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCart);
router.post("/remove", protect, removeFromCart); // requirements say POST /cart/remove though conceptually DELETE /cart/:id is better, matching requirements exactly

export default router;
