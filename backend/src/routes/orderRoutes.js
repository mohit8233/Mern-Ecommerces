import express from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create order
router.post("/", protect, createOrder);

// Get logged-in user's orders
router.get("/my-orders", protect, getMyOrders);

// Get single order
router.get("/:id", protect, getOrderById);

// Cancel order
router.patch("/:id/cancel", protect, cancelOrder);

export default router;