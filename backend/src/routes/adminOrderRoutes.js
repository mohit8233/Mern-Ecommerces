import express from "express";

import {
    getAllOrders,
    getAdminOrderById,
    updateOrderStatus,
    adminCancelOrder,
    refundOrder
} from "../controllers/adminOrderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();


// Get all orders
router.get(
    "/",
    protect,
    adminOnly,
    getAllOrders
);


// Get single order
router.get(
    "/:id",
    protect,
    adminOnly,
    getAdminOrderById
);


// Update order status
router.patch(
    "/:id/status",
    protect,
    adminOnly,
    updateOrderStatus
);


// Cancel order
router.patch(
    "/:id/cancel",
    protect,
    adminOnly,
    adminCancelOrder
);


// Refund order
router.post(
    "/:id/refund",
    protect,
    adminOnly,
    refundOrder
);


export default router;