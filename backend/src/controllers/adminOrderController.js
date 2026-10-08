import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import razorpay from "../config/razorpay.js";


// ==========================================
// GET ALL ORDERS
// ==========================================

export const getAllOrders = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            status = "",
            paymentStatus = "",
            search = "",
            sort = "latest"
        } = req.query;

        page = Math.max(parseInt(page), 1);
        limit = Math.min(Math.max(parseInt(limit), 1), 100);

        const skip = (page - 1) * limit;

        const query = {};

        // Order status filter
        if (status) {
            query.orderStatus = status;
        }

        // Payment status filter
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        // Search
        if (search) {
            query.$or = [
                {
                    orderNumber: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        // Sorting
        let sortOption = {
            createdAt: -1
        };

        if (sort === "oldest") {
            sortOption = {
                createdAt: 1
            };
        }

        if (sort === "highest") {
            sortOption = {
                totalAmount: -1
            };
        }

        if (sort === "lowest") {
            sortOption = {
                totalAmount: 1
            };
        }

        const [orders, totalOrders] = await Promise.all([
            Order.find(query)
                .populate(
                    "user",
                    "name email"
                )
                .populate(
                    "items.product",
                    "name images price discountPrice"
                )
                .sort(sortOption)
                .skip(skip)
                .limit(limit),

            Order.countDocuments(query)
        ]);

        const totalPages = Math.ceil(
            totalOrders / limit
        );

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",

            orders,

            pagination: {
                currentPage: page,
                totalPages,
                totalOrders,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (error) {
        console.error(
            "Get All Orders Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};


// ==========================================
// GET SINGLE ORDER - ADMIN
// ==========================================

export const getAdminOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id)
            .populate(
                "user",
                "name email"
            )
            .populate(
                "items.product",
                "name images price discountPrice stock"
            );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error(
            "Get Admin Order Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch order",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Cannot modify refunded order
        if (
            order.paymentStatus === "refunded" &&
            orderStatus !== "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message: "Refunded order cannot be moved to another status"
            });
        }

        // Delivered order cannot go backwards
        if (
            order.orderStatus === "delivered" &&
            orderStatus !== "delivered"
        ) {
            return res.status(400).json({
                success: false,
                message: "Delivered order status cannot be changed"
            });
        }

        // Cancelled order cannot be reopened
        if (
            order.orderStatus === "cancelled" &&
            orderStatus !== "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message: "Cancelled order cannot be reopened"
            });
        }

        order.orderStatus = orderStatus;

        if (orderStatus === "delivered") {
            order.deliveredAt = new Date();
        }

        if (orderStatus === "cancelled") {
            order.cancelledAt = new Date();
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error(
            "Update Order Status Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message
        });
    }
};


// ==========================================
// ADMIN CANCEL ORDER
// ==========================================

export const adminCancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            reason = "Cancelled by admin"
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus === "delivered") {
            return res.status(400).json({
                success: false,
                message: "Delivered order cannot be cancelled"
            });
        }

        if (order.orderStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Order is already cancelled"
            });
        }

        order.orderStatus = "cancelled";
        order.cancelledAt = new Date();
        order.cancelReason = reason;

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        console.error(
            "Admin Cancel Order Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to cancel order",
            error: error.message
        });
    }
};


// ==========================================
// REFUND PAID ORDER
// ==========================================

export const refundOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            reason = "Refund initiated by admin"
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Payment must be paid
        if (order.paymentStatus !== "paid") {
            return res.status(400).json({
                success: false,
                message: "Only paid orders can be refunded"
            });
        }

        // Payment ID required
        if (!order.razorpayPaymentId) {
            return res.status(400).json({
                success: false,
                message: "Razorpay payment ID not found"
            });
        }

        // Already refunded
        if (order.razorpayRefundId) {
            return res.status(400).json({
                success: false,
                message: "Order is already refunded"
            });
        }

        const refundAmount = Math.round(
            order.totalAmount * 100
        );

        // Razorpay refund
        const refund = await razorpay.payments.refund(
            order.razorpayPaymentId,
            {
                amount: refundAmount,
                speed: "normal",
                notes: {
                    orderId: order._id.toString(),
                    orderNumber: order.orderNumber,
                    reason
                }
            }
        );

        // Update order
        order.paymentStatus = "refunded";
        order.orderStatus = "cancelled";

        order.razorpayRefundId = refund.id;

        order.refundAmount =
            refundAmount / 100;

        order.refundedAt = new Date();
        order.refundReason = reason;

        order.cancelledAt = new Date();
        order.cancelReason = reason;

        await order.save();

        res.status(200).json({
            success: true,
            message: "Refund initiated successfully",

            refund: {
                id: refund.id,
                amount: refundAmount / 100,
                status: refund.status
            },

            order
        });

    } catch (error) {
        console.error(
            "Refund Order Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Refund failed",
            error: error.error?.description || error.message
        });
    }
};