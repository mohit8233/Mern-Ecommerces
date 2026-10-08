import express from "express";

import {
    register,
    login,
    getMe
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();


// Public
router.post("/register", register);
router.post("/login", login);


// Logged-in user
router.get("/me", protect, getMe);


// Admin only
router.get("/admin-test", protect, adminOnly, (req, res) => {
    res.json({
        success: true,
        message: "Welcome Admin!",
        admin: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
        }
    });
});


export default router;