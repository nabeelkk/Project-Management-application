import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    description: { type: String, required: true },
    images: [{ type: String }],
    videos: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
