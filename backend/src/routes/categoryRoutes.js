import express from "express";

import {
    createCategory,
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    createMultipleCategories
} from "../controllers/categoryController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();


// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all active categories
router.get("/", getCategories);

// Get category by slug
router.get("/slug/:slug", getCategoryBySlug);

// Get category by ID
router.get("/:id", getCategoryById);


// ==========================================
// ADMIN ROUTES
// ==========================================

// Create
router.post(
    "/",
    protect,
    adminOnly,
    createCategory
);

// Update
router.put(
    "/:id",
    protect,
    adminOnly,
    updateCategory
);

// Delete
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteCategory
);
router.post(
    "/bulk",
    protect,
    adminOnly,
    createMultipleCategories
);

export default router;