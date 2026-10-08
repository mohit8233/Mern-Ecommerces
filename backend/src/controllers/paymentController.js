import crypto from "crypto";

import razorpay from "../config/razorpay.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";


// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

export const createRazorpayOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        // Find user's order
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Only pending orders can be paid
        if (order.paymentStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This order cannot be paid"
            });
        }

        // Cancelled order cannot be paid
        if (order.orderStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled order cannot be paid"
            });
        }

        // Amount in INR -> paise
        const amountInPaise = Math.round(
            order.totalAmount * 100
        );

        if (amountInPaise <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order amount"
            });
        }

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: order.orderNumber,
            notes: {
                orderId: order._id.toString(),
                userId: req.user._id.toString()
            }
        });

        // Save Razorpay order ID
        order.razorpayOrderId = razorpayOrder.id;

        await order.save();

        res.status(200).json({
            success: true,
            message: "Razorpay order created successfully",

            razorpay: {
                keyId: process.env.RAZORPAY_KEY_ID,
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            },

            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount
            }
        });
    } catch (error) {
        console.error(
            "Create Razorpay Order Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to create Razorpay order"
        });
    }
};


// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !orderId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification data is incomplete"
            });
        }

        // Find user's order
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Already paid
        if (order.paymentStatus === "paid") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                order
            });
        }

        // Make sure Razorpay order belongs to our order
        if (
            order.razorpayOrderId !== razorpay_order_id
        ) {
            return res.status(400).json({
                success: false,
                message: "Razorpay order mismatch"
            });
        }

        // ==========================================
        // GENERATE SIGNATURE
        // ==========================================

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");

        // Timing-safe comparison
        const isSignatureValid =
            generatedSignature.length ===
                razorpay_signature.length &&
            crypto.timingSafeEqual(
                Buffer.from(generatedSignature),
                Buffer.from(razorpay_signature)
            );

        if (!isSignatureValid) {
            order.paymentStatus = "failed";

            await order.save();

            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // ==========================================
        // PAYMENT VERIFIED
        // ==========================================

        order.paymentStatus = "paid";

        order.orderStatus = "confirmed";

        order.razorpayPaymentId =
            razorpay_payment_id;

        order.paidAt = new Date();

        await order.save();

        // ==========================================
        // REDUCE STOCK
        // ==========================================

        for (const item of order.items) {
            const product = await Product.findById(
                item.product
            );

            if (!product) {
                continue;
            }

            // Protect against negative stock
            if (product.stock < item.quantity) {
                return res.status(409).json({
                    success: false,
                    message:
                        `${product.name} is no longer available in requested quantity. Please contact support.`,
                    paymentVerified: true,
                    order
                });
            }

            product.stock -= item.quantity;

            product.soldCount += item.quantity;

            await product.save();
        }

        // ==========================================
        // CLEAR CART
        // ==========================================

        await Cart.findOneAndUpdate(
            {
                user: req.user._id
            },
            {
                $set: {
                    items: []
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            order
        });
    } catch (error) {
        console.error(
            "Verify Razorpay Payment Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Payment verification failed"
        });
    }
};
// ==========================================
// REFUND RAZORPAY PAYMENT
// ==========================================

export const refundRazorpayPayment = async (req, res) => {
    try {
        const { orderId, reason = "Order cancelled by customer" } =
            req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.paymentStatus !== "paid") {
            return res.status(400).json({
                success: false,
                message: "Only paid orders can be refunded"
            });
        }

        if (!order.razorpayPaymentId) {
            return res.status(400).json({
                success: false,
                message: "Razorpay payment ID not found"
            });
        }

        if (order.paymentStatus === "refunded") {
            return res.status(400).json({
                success: false,
                message: "This order has already been refunded"
            });
        }

        if (order.orderStatus === "delivered") {
            return res.status(400).json({
                success: false,
                message: "Delivered orders cannot be cancelled"
            });
        }

        // Create Razorpay refund
        const refund = await razorpay.payments.refund(
            order.razorpayPaymentId,
            {
                amount: Math.round(
                    order.totalAmount * 100
                ),
                notes: {
                    orderId: order._id.toString(),
                    reason
                }
            }
        );

        // Update order
        order.paymentStatus = "refunded";

        order.orderStatus = "cancelled";

        order.razorpayRefundId = refund.id;

        order.refundAmount = order.totalAmount;

        order.refundedAt = new Date();

        order.refundReason = reason;

        order.cancelledAt = new Date();

        order.cancelReason = reason;

        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: item.quantity,
                        soldCount: -item.quantity
                    }
                }
            );
        }

        res.status(200).json({
            success: true,
            message:
                "Order cancelled and refund initiated successfully",
            refund: {
                id: refund.id,
                amount: refund.amount,
                status: refund.status
            },
            order
        });
    } catch (error) {
        console.error(
            "Refund Razorpay Payment Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                error?.error?.description ||
                "Unable to process refund"
        });
    }
};