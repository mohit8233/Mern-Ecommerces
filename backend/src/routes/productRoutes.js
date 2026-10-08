import express from "express";

import {
    createProduct,
    getProducts,
    getProductById,
    getProductBySlug,
    updateProduct,
    deleteProduct,
    createMultipleProducts
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();


// ==========================================
// PUBLIC
// ==========================================

router.get("/", getProducts);

router.get("/slug/:slug", getProductBySlug);

router.get("/:id", getProductById);


// ==========================================
// ADMIN
// ==========================================

router.post(
    "/",
    protect,
    adminOnly,
    createProduct
);

router.put(
    "/:id",
    protect,
    adminOnly,
    updateProduct
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteProduct
);
router.post(
    "/bulk",
    protect,
    adminOnly,
    createMultipleProducts
);

export default router;