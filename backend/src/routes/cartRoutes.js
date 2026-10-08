import express from "express";

import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from "../controllers/cartController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// ==========================================
// CART ROUTES
// ==========================================

router.get(
    "/",
    protect,
    getCart
);


router.post(
    "/add",
    protect,
    addToCart
);


router.put(
    "/update",
    protect,
    updateCartItem
);


router.delete(
    "/remove/:productId",
    protect,
    removeCartItem
);


router.delete(
    "/clear",
    protect,
    clearCart
);


export default router;