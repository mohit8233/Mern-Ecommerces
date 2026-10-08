import express from "express";

import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist,
    moveToCart
} from "../controllers/wishlistController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get wishlist
router.get("/", protect, getWishlist);

// Check product
router.get("/check/:productId", protect, checkWishlist);

// Add product
router.post("/add", protect, addToWishlist);

// Move wishlist product to cart
router.post("/move-to-cart", protect, moveToCart);

// Remove product
router.delete("/remove/:productId", protect, removeFromWishlist);

export default router;