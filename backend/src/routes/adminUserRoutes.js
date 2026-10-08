import express from "express";

import {
    getAllUsers,
    getUserById,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    getUserOrders
} from "../controllers/adminUserController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();


// ==========================================
// GET ALL USERS
// ==========================================

router.get(
    "/",
    protect,
    adminOnly,
    getAllUsers
);


// ==========================================
// GET USER ORDERS
// ==========================================

router.get(
    "/:id/orders",
    protect,
    adminOnly,
    getUserOrders
);


// ==========================================
// GET SINGLE USER
// ==========================================

router.get(
    "/:id",
    protect,
    adminOnly,
    getUserById
);


// ==========================================
// BLOCK / UNBLOCK USER
// ==========================================

router.patch(
    "/:id/status",
    protect,
    adminOnly,
    updateUserStatus
);


// ==========================================
// CHANGE USER ROLE
// ==========================================

router.patch(
    "/:id/role",
    protect,
    adminOnly,
    updateUserRole
);


// ==========================================
// DELETE USER
// ==========================================

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteUser
);


export default router;