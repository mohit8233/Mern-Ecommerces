import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

// ==========================================
// GET WISHLIST
// ==========================================

export const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({
            user: req.user._id
        }).populate({
            path: "products",
            match: { isActive: true },
            populate: {
                path: "category",
                select: "name slug"
            }
        });

        // Create empty wishlist if user doesn't have one
        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user._id,
                products: []
            });
        }

        const products = wishlist.products || [];

        res.status(200).json({
            success: true,
            count: products.length,
            wishlist: {
                id: wishlist._id,
                user: wishlist.user,
                products
            }
        });
    } catch (error) {
        console.error("Get Wishlist Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching wishlist"
        });
    }
};


// ==========================================
// ADD PRODUCT TO WISHLIST
// ==========================================

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Check product
        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Find wishlist
        let wishlist = await Wishlist.findOne({
            user: req.user._id
        });

        // Create wishlist if not exists
        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user._id,
                products: [productId]
            });

            return res.status(201).json({
                success: true,
                message: "Product added to wishlist",
                wishlist
            });
        }

        // Check duplicate
        const alreadyExists = wishlist.products.some(
            (id) => id.toString() === productId.toString()
        );

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Product already exists in wishlist"
            });
        }

        wishlist.products.push(productId);

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            wishlist
        });
    } catch (error) {
        console.error("Add Wishlist Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while adding product to wishlist"
        });
    }
};


// ==========================================
// REMOVE PRODUCT FROM WISHLIST
// ==========================================

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const wishlist = await Wishlist.findOne({
            user: req.user._id
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        const productExists = wishlist.products.some(
            (id) => id.toString() === productId
        );

        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        wishlist.products = wishlist.products.filter(
            (id) => id.toString() !== productId
        );

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            wishlist
        });
    } catch (error) {
        console.error("Remove Wishlist Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while removing product"
        });
    }
};


// ==========================================
// CHECK PRODUCT IN WISHLIST
// ==========================================

export const checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const wishlist = await Wishlist.findOne({
            user: req.user._id
        });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                isWishlisted: false
            });
        }

        const isWishlisted = wishlist.products.some(
            (id) => id.toString() === productId
        );

        res.status(200).json({
            success: true,
            isWishlisted
        });
    } catch (error) {
        console.error("Check Wishlist Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while checking wishlist"
        });
    }
};


// ==========================================
// MOVE WISHLIST PRODUCT TO CART
// ==========================================

export const moveToCart = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Check wishlist
        const wishlist = await Wishlist.findOne({
            user: req.user._id
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        const wishlistProductExists = wishlist.products.some(
            (id) => id.toString() === productId
        );

        if (!wishlistProductExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        // Check product
        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product is no longer available"
            });
        }

        // Check stock
        if (product.stock < 1) {
            return res.status(400).json({
                success: false,
                message: "Product is currently out of stock"
            });
        }

        // Find cart
        let cart = await Cart.findOne({
            user: req.user._id
        });

        // Create cart if not exists
        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [
                    {
                        product: productId,
                        quantity: 1
                    }
                ]
            });
        } else {
            // Check if product already exists in cart
            const cartItem = cart.items.find(
                (item) =>
                    item.product.toString() === productId.toString()
            );

            if (cartItem) {
                if (cartItem.quantity + 1 > product.stock) {
                    return res.status(400).json({
                        success: false,
                        message: `Only ${product.stock} item(s) available in stock`
                    });
                }

                cartItem.quantity += 1;
            } else {
                cart.items.push({
                    product: productId,
                    quantity: 1
                });
            }

            await cart.save();
        }

        // Remove from wishlist
        wishlist.products = wishlist.products.filter(
            (id) => id.toString() !== productId
        );

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Product moved from wishlist to cart",
            cart,
            wishlist
        });
    } catch (error) {
        console.error("Move To Cart Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while moving product to cart"
        });
    }
};