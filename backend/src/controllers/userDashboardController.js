import User from "../models/User.js";
import Order from "../models/Order.js";
import Wishlist from "../models/Wishlist.js";
import Cart from "../models/Cart.js";

export const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        const [
            user,
            totalOrders,
            pendingOrders,
            deliveredOrders,
            cancelledOrders,
            wishlist,
            cart,
            recentOrders
        ] = await Promise.all([
            User.findById(userId).select(
                "name email role createdAt"
            ),

            Order.countDocuments({
                user: userId
            }),

            Order.countDocuments({
                user: userId,
                orderStatus: {
                    $in: ["pending", "confirmed", "processing", "shipped"]
                }
            }),

            Order.countDocuments({
                user: userId,
                orderStatus: "delivered"
            }),

            Order.countDocuments({
                user: userId,
                orderStatus: "cancelled"
            }),

            Wishlist.findOne({
                user: userId
            }).populate(
                "products",
                "name images price discountPrice rating"
            ),

            Cart.findOne({
                user: userId
            }),

            Order.find({
                user: userId
            })
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .select(
                    "orderNumber totalAmount paymentStatus orderStatus createdAt"
                )
        ]);

        // ======================================
        // TOTAL SPENT
        // ======================================

        const spentResult = await Order.aggregate([
            {
                $match: {
                    user: userId,
                    paymentStatus: "paid"
                }
            },
            {
                $group: {
                    _id: null,
                    totalSpent: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);

        const totalSpent =
            spentResult[0]?.totalSpent || 0;

        // ======================================
        // CART ITEMS
        // ======================================

        const cartItems =
            cart?.items?.length || 0;

        // ======================================
        // RESPONSE
        // ======================================

        res.status(200).json({
            success: true,

            dashboard: {
                user,

                statistics: {
                    totalOrders,
                    pendingOrders,
                    deliveredOrders,
                    cancelledOrders,
                    totalSpent: Number(
                        totalSpent.toFixed(2)
                    ),
                    wishlistItems:
                        wishlist?.products?.length || 0,
                    cartItems
                },

                wishlist:
                    wishlist?.products || [],

                recentOrders
            }
        });

    } catch (error) {
        console.error(
            "User Dashboard Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch user dashboard",
            error: error.message
        });
    }
};