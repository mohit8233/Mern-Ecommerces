import mongoose from "mongoose";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import generateOrderNumber from "../utils/generateOrderNumber.js";


// ==========================================
// CREATE ORDER
// ==========================================

export const createOrder = async (req, res) => {
    try {
        const {
            addressId,
            paymentMethod = "razorpay"
        } = req.body;

        // Validate address ID
        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "Address ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID"
            });
        }

        // Only supported payment methods
        if (!["razorpay", "cod"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method"
            });
        }

        // ==========================================
        // GET CART
        // ==========================================

        const cart = await Cart.findOne({
            user: req.user._id
        }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        // ==========================================
        // GET ADDRESS
        // ==========================================

        const address = await Address.findOne({
            _id: addressId,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // ==========================================
        // CHECK PRODUCTS + STOCK
        // ==========================================

        const orderItems = [];

        let subtotal = 0;

        for (const cartItem of cart.items) {
            const product = cartItem.product;

            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message:
                        "One or more products in your cart are no longer available"
                });
            }

            if (product.stock < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} has only ${product.stock} item(s) left`
                });
            }

            // Use discounted price if available
            const price =
                product.discountPrice !== null &&
                product.discountPrice !== undefined
                    ? product.discountPrice
                    : product.price;

            const itemTotal = price * cartItem.quantity;

            subtotal += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.images?.[0] || "",
                quantity: cartItem.quantity,
                price,
                total: itemTotal
            });
        }

        // ==========================================
        // ORDER CALCULATION
        // ==========================================

        // Free shipping above ₹999
        const shippingCharge = subtotal >= 999 ? 0 : 50;

        // 18% GST example
        const tax = Math.round(subtotal * 0.18);

        const discount = 0;

        const totalAmount =
            subtotal +
            shippingCharge +
            tax -
            discount;

        // ==========================================
        // ADDRESS SNAPSHOT
        // ==========================================

        const shippingAddress = {
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            landmark: address.landmark
        };

        // ==========================================
        // CREATE ORDER
        // ==========================================

        const order = await Order.create({
            orderNumber: generateOrderNumber(),

            user: req.user._id,

            items: orderItems,

            shippingAddress,

            subtotal,

            shippingCharge,

            tax,

            discount,

            totalAmount,

            paymentMethod,

            paymentStatus:
                paymentMethod === "cod"
                    ? "pending"
                    : "pending",

            orderStatus:
                paymentMethod === "cod"
                    ? "confirmed"
                    : "pending"
        });

        // ==========================================
        // COD STOCK UPDATE
        // ==========================================

        if (paymentMethod === "cod") {
            for (const item of cart.items) {
                await Product.findByIdAndUpdate(
                    item.product._id,
                    {
                        $inc: {
                            stock: -item.quantity,
                            soldCount: item.quantity
                        }
                    }
                );
            }

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
        }

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order
        });
    } catch (error) {
        console.error("Create Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating order"
        });
    }
};


// ==========================================
// GET MY ORDERS
// ==========================================

export const getMyOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = Math.max(
            parseInt(page) || 1,
            1
        );

        const perPage = Math.min(
            Math.max(parseInt(limit) || 10, 1),
            50
        );

        const skip =
            (currentPage - 1) * perPage;

        const [orders, totalOrders] =
            await Promise.all([
                Order.find({
                    user: req.user._id
                })
                    .sort({
                        createdAt: -1
                    })
                    .skip(skip)
                    .limit(perPage),

                Order.countDocuments({
                    user: req.user._id
                })
            ]);

        res.status(200).json({
            success: true,

            count: orders.length,

            pagination: {
                currentPage,
                limit: perPage,
                totalOrders,
                totalPages: Math.ceil(
                    totalOrders / perPage
                )
            },

            orders
        });
    } catch (error) {
        console.error("Get My Orders Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching orders"
        });
    }
};


// ==========================================
// GET SINGLE ORDER
// ==========================================

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        }).populate(
            "items.product",
            "name slug images brand"
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
        console.error("Get Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching order"
        });
    }
};


// ==========================================
// CANCEL ORDER
// ==========================================

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Cannot cancel delivered/cancelled order
        if (
            ["delivered", "cancelled"].includes(
                order.orderStatus
            )
        ) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled because it is already ${order.orderStatus}`
            });
        }

        // Paid order cancellation will be handled
        // with refund logic later.
        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message:
                    "Paid orders require refund processing before cancellation"
            });
        }

        order.orderStatus = "cancelled";

        order.cancelledAt = new Date();

        order.cancelReason =
            req.body.reason ||
            "Cancelled by customer";

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

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        });
    } catch (error) {
        console.error("Cancel Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while cancelling order"
        });
    }
};