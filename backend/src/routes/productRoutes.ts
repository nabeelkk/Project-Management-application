import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getUploadUrl,
} from "../controllers/productController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.route("/").get(getProducts).post(protect, createProduct);
router.get("/upload-url", protect, getUploadUrl);
router
  .route("/:id")
  .get(getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

export default router;
