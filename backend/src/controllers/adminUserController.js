import mongoose from "mongoose";

import User from "../models/User.js";
import Order from "../models/Order.js";


// ==========================================
// GET ALL USERS
// ==========================================

export const getAllUsers = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            search = "",
            status = "",
            role = "",
            sort = "latest"
        } = req.query;

        page = Math.max(parseInt(page) || 1, 1);

        limit = Math.min(
            Math.max(parseInt(limit) || 10, 1),
            100
        );

        const skip = (page - 1) * limit;

        const query = {
            role: {
                $ne: "admin"
            }
        };

        // Search by name or email
        if (search.trim()) {
            query.$or = [
                {
                    name: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                }
            ];
        }

        // Active / inactive
        if (status === "active") {
            query.isActive = true;
        }

        if (status === "inactive") {
            query.isActive = false;
        }

        // Optional role filter
        if (
            role === "user" ||
            role === "admin"
        ) {
            query.role = role;
        }

        let sortOption = {
            createdAt: -1
        };

        if (sort === "oldest") {
            sortOption = {
                createdAt: 1
            };
        }

        if (sort === "name") {
            sortOption = {
                name: 1
            };
        }

        const [
            users,
            totalUsers
        ] = await Promise.all([
            User.find(query)
                .select(
                    "-password"
                )
                .sort(sortOption)
                .skip(skip)
                .limit(limit),

            User.countDocuments(query)
        ]);

        const totalPages = Math.ceil(
            totalUsers / limit
        );

        res.status(200).json({
            success: true,

            users,

            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                limit,

                hasNextPage:
                    page < totalPages,

                hasPreviousPage:
                    page > 1
            }
        });

    } catch (error) {
        console.error(
            "Get All Users Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch users",
            error: error.message
        });
    }
};


// ==========================================
// GET SINGLE USER
// ==========================================

export const getUserById = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user =
            await User.findById(id)
                .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // User order statistics
        const [
            totalOrders,
            paidOrders,
            cancelledOrders
        ] = await Promise.all([
            Order.countDocuments({
                user: user._id
            }),

            Order.countDocuments({
                user: user._id,
                paymentStatus: "paid"
            }),

            Order.countDocuments({
                user: user._id,
                orderStatus: "cancelled"
            })
        ]);

        const revenueResult =
            await Order.aggregate([
                {
                    $match: {
                        user: user._id,
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
            revenueResult.length > 0
                ? revenueResult[0].totalSpent
                : 0;

        res.status(200).json({
            success: true,

            user,

            statistics: {
                totalOrders,
                paidOrders,
                cancelledOrders,
                totalSpent
            }
        });

    } catch (error) {
        console.error(
            "Get User Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch user",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE USER STATUS
// ==========================================

export const updateUserStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const { isActive } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (
            typeof isActive !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "isActive must be true or false"
            });
        }

        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Admin cannot change admin
        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message:
                    "Admin account cannot be blocked from user management"
            });
        }

        user.isActive = isActive;

        await user.save();

        res.status(200).json({
            success: true,
            message: isActive
                ? "User activated successfully"
                : "User blocked successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error(
            "Update User Status Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update user status",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE USER ROLE
// ==========================================

export const updateUserRole = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const { role } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (
            !["user", "admin"].includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Role must be user or admin"
            });
        }

        // Prevent current admin from
        // changing their own role
        if (
            req.user._id.toString() === id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot change your own role"
            });
        }

        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.role = role;

        await user.save();

        res.status(200).json({
            success: true,
            message:
                "User role updated successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error(
            "Update User Role Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update user role",
            error: error.message
        });
    }
};


// ==========================================
// DELETE USER
// ==========================================

export const deleteUser = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        // Prevent admin deleting himself
        if (
            req.user._id.toString() === id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot delete your own account"
            });
        }

        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Don't delete admin
        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message:
                    "Admin account cannot be deleted from user management"
            });
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message:
                "User deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete User Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to delete user",
            error: error.message
        });
    }
};


// ==========================================
// GET USER ORDERS
// ==========================================

export const getUserOrders = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user =
            await User.findById(id)
                .select(
                    "name email role isActive"
                );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const orders =
            await Order.find({
                user: id
            })
                .populate(
                    "items.product",
                    "name images price"
                )
                .sort({
                    createdAt: -1
                });

        res.status(200).json({
            success: true,

            user,

            count: orders.length,

            orders
        });

    } catch (error) {
        console.error(
            "Get User Orders Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch user orders",
            error: error.message
        });
    }
};