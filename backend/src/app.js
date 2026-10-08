import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from "./routes/paymentRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import userDashboardRoutes from "./routes/userDashboardRoutes.js";


const app = express();


// ==============================
// SECURITY
// ==============================

app.use(helmet());


// ==============================
// CORS
// ==============================

app.use(
    cors({
        origin:[ "http://localhost:5173",
            "https://mern-ecommerces-ten.vercel.app/"],
        credentials: true
    })
);


// ==============================
// BODY PARSER
// ==============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ==============================
// RATE LIMIT
// ==============================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use("/api", limiter);


// ==============================
// ROUTES
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders",orderRoutes)
app.use("/api/payments", paymentRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use(
    "/api/admin/users",
    adminUserRoutes
);
app.use(
    "/api/admin/dashboard",
    adminDashboardRoutes
);
app.use(
    "/api/user/dashboard",
    userDashboardRoutes
);


// ==============================
// HOME
// ==============================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "E-commerce API is running"
    });
});


export default app;