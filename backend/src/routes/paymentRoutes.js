import express from "express";

import {
    createRazorpayOrder,
    verifyRazorpayPayment,
    refundRazorpayPayment
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// Create Razorpay order
router.post(
    "/razorpay/create-order",
    protect,
    createRazorpayOrder
);

router.post(
    "/razorpay/refund",
    protect,
    refundRazorpayPayment
);
// Verify Razorpay payment
router.post(
    "/razorpay/verify",
    protect,
    verifyRazorpayPayment
);


export default router;