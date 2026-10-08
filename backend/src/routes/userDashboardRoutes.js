import express from "express";

import {
    getUserDashboard
} from "../controllers/userDashboardController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    protect,
    getUserDashboard
);

export default router;