import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";


// ==========================================
// ADMIN DASHBOARD
// ==========================================

export const getAdminDashboard = async (req, res) => {
    try {
        // ======================================
        // BASIC COUNTS
        // ======================================

        const [
            totalUsers,
            totalProducts,
            totalOrders,

            pendingOrders,
            confirmedOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,

            paidOrders,
            refundedOrders,

            lowStockProducts,
            outOfStockProducts
        ] = await Promise.all([
            User.countDocuments({
                role: "user"
            }),

            Product.countDocuments({
                isActive: true
            }),

            Order.countDocuments(),

            Order.countDocuments({
                orderStatus: "pending"
            }),

            Order.countDocuments({
                orderStatus: "confirmed"
            }),

            Order.countDocuments({
                orderStatus: "processing"
            }),

            Order.countDocuments({
                orderStatus: "shipped"
            }),

            Order.countDocuments({
                orderStatus: "delivered"
            }),

            Order.countDocuments({
                orderStatus: "cancelled"
            }),

            Order.countDocuments({
                paymentStatus: "paid"
            }),

            Order.countDocuments({
                paymentStatus: "refunded"
            }),

            Product.countDocuments({
                isActive: true,
                stock: {
                    $gt: 0,
                    $lte: 5
                }
            }),

            Product.countDocuments({
                isActive: true,
                stock: 0
            })
        ]);


        // ======================================
        // REVENUE
        // ======================================

        const revenueResult =
            await Order.aggregate([
                {
                    $match: {
                        paymentStatus: "paid"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]);

        const totalRevenue =
            revenueResult[0]?.totalRevenue || 0;


        // ======================================
        // REFUND
        // ======================================

        const refundResult =
            await Order.aggregate([
                {
                    $match: {
                        paymentStatus: "refunded"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRefund: {
                            $sum: "$refundAmount"
                        }
                    }
                }
            ]);

        const totalRefund =
            refundResult[0]?.totalRefund || 0;


        // ======================================
        // NET REVENUE
        // ======================================

        const netRevenue =
            totalRevenue - totalRefund;


        // ======================================
        // AVERAGE ORDER VALUE
        // ======================================

        const averageOrderResult =
            await Order.aggregate([
                {
                    $match: {
                        paymentStatus: "paid"
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageOrderValue: {
                            $avg: "$totalAmount"
                        }
                    }
                }
            ]);

        const averageOrderValue =
            averageOrderResult[0]
                ?.averageOrderValue || 0;


        // ======================================
        // RECENT ORDERS
        // ======================================

        const recentOrders =
            await Order.find()
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    createdAt: -1
                })
                .limit(10)
                .select(
                    "orderNumber user totalAmount paymentStatus orderStatus createdAt"
                );


        // ======================================
        // TOP PRODUCTS
        // ======================================

        const topProducts =
            await Product.find({
                isActive: true
            })
                .populate(
                    "category",
                    "name"
                )
                .sort({
                    soldCount: -1
                })
                .limit(10)
                .select(
                    "name images price discountPrice stock soldCount rating"
                );


        // ======================================
        // MONTHLY SALES
        // ======================================

        const currentYear =
            new Date().getFullYear();

        const monthlySales =
            await Order.aggregate([
                {
                    $match: {
                        paymentStatus: "paid",

                        createdAt: {
                            $gte: new Date(
                                `${currentYear}-01-01`
                            ),
                            $lt: new Date(
                                `${currentYear + 1}-01-01`
                            )
                        }
                    }
                },

                {
                    $group: {
                        _id: {
                            month: {
                                $month: "$createdAt"
                            }
                        },

                        revenue: {
                            $sum: "$totalAmount"
                        },

                        orders: {
                            $sum: 1
                        }
                    }
                },

                {
                    $sort: {
                        "_id.month": 1
                    }
                }
            ]);


        // ======================================
        // FORMAT MONTHLY SALES
        // ======================================

        const formattedMonthlySales =
            Array.from(
                { length: 12 },
                (_, index) => {

                    const monthNumber =
                        index + 1;

                    const monthData =
                        monthlySales.find(
                            (item) =>
                                item._id.month ===
                                monthNumber
                        );

                    return {
                        month: monthNumber,

                        revenue:
                            monthData?.revenue ||
                            0,

                        orders:
                            monthData?.orders ||
                            0
                    };
                }
            );


        // ======================================
        // DASHBOARD RESPONSE
        // ======================================

        res.status(200).json({
            success: true,

            dashboard: {

                overview: {
                    totalUsers,
                    totalProducts,
                    totalOrders,

                    totalRevenue:
                        Number(
                            totalRevenue.toFixed(2)
                        ),

                    totalRefund:
                        Number(
                            totalRefund.toFixed(2)
                        ),

                    netRevenue:
                        Number(
                            netRevenue.toFixed(2)
                        ),

                    averageOrderValue:
                        Number(
                            averageOrderValue.toFixed(2)
                        )
                },


                orders: {
                    pending: pendingOrders,
                    confirmed: confirmedOrders,
                    processing: processingOrders,
                    shipped: shippedOrders,
                    delivered: deliveredOrders,
                    cancelled: cancelledOrders
                },


                payments: {
                    paid: paidOrders,
                    refunded: refundedOrders
                },


                inventory: {
                    lowStock: lowStockProducts,
                    outOfStock: outOfStockProducts
                },


                monthlySales:
                    formattedMonthlySales,


                recentOrders,


                topProducts
            }
        });

    } catch (error) {
        console.error(
            "Admin Dashboard Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch dashboard data",
            error: error.message
        });
    }
};