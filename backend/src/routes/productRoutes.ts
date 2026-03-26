import express from "express";
import {
    getProducts,
    getCategories,
    getProductById,
    addReview
} from "../controllers/productController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/categories", getCategories);        // GET /api/products/categories
router.get("/", getProducts);                    // GET /api/products?q=...&category=...
router.get("/:id", getProductById);              // GET /api/products/:id
router.post("/:id/reviews", protect, addReview); // POST /api/products/:id/reviews

export default router;