import Cart from "../models/Cart.js";
import Product from "../models/Product.js";


// ==========================================
// GET CART
// ==========================================

export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({
            user: req.user._id
        }).populate({
            path: "items.product",
            select: "name slug price discountPrice images stock brand category isActive",
            populate: {
                path: "category",
                select: "name slug"
            }
        });


        // Agar cart nahi hai
        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: []
            });

            return res.status(200).json({
                success: true,
                cart: {
                    _id: cart._id,
                    user: cart.user,
                    items: [],
                    totalItems: 0,
                    subtotal: 0
                }
            });
        }


        // Invalid / deleted products remove karna
        cart.items = cart.items.filter(
            (item) =>
                item.product &&
                item.product.isActive
        );


        await cart.save();


        let totalItems = 0;
        let subtotal = 0;


        cart.items.forEach((item) => {
            const product = item.product;

            const itemPrice =
                product.discountPrice !== null &&
                product.discountPrice !== undefined
                    ? product.discountPrice
                    : product.price;

            totalItems += item.quantity;

            subtotal += itemPrice * item.quantity;
        });


        res.status(200).json({
            success: true,

            cart: {
                _id: cart._id,
                user: cart.user,
                items: cart.items,
                totalItems,
                subtotal
            }
        });

    } catch (error) {
        console.error("Get Cart Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching cart"
        });
    }
};


// ==========================================
// ADD TO CART
// ==========================================

export const addToCart = async (req, res) => {
    try {
        const {
            productId,
            quantity = 1
        } = req.body;


        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }


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


        const requestedQuantity = Number(quantity);


        if (
            !Number.isInteger(requestedQuantity) ||
            requestedQuantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a valid positive number"
            });
        }


        if (product.stock < requestedQuantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items are available`
            });
        }


        let cart = await Cart.findOne({
            user: req.user._id
        });


        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: []
            });
        }


        const existingItemIndex =
            cart.items.findIndex(
                (item) =>
                    item.product.toString() ===
                    productId.toString()
            );


        if (existingItemIndex !== -1) {
            const newQuantity =
                cart.items[existingItemIndex].quantity +
                requestedQuantity;


            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Only ${product.stock} items are available`
                });
            }


            cart.items[existingItemIndex].quantity =
                newQuantity;

        } else {
            cart.items.push({
                product: productId,
                quantity: requestedQuantity
            });
        }


        await cart.save();


        const updatedCart =
            await Cart.findById(cart._id)
                .populate({
                    path: "items.product",
                    select:
                        "name slug price discountPrice images stock brand category",
                    populate: {
                        path: "category",
                        select: "name slug"
                    }
                });


        res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart: updatedCart
        });

    } catch (error) {
        console.error("Add Cart Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while adding product to cart"
        });
    }
};


// ==========================================
// UPDATE CART ITEM QUANTITY
// ==========================================

export const updateCartItem = async (req, res) => {
    try {
        const {
            productId,
            quantity
        } = req.body;


        if (!productId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product ID and quantity are required"
            });
        }


        const newQuantity = Number(quantity);


        if (
            !Number.isInteger(newQuantity) ||
            newQuantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be a positive whole number"
            });
        }


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


        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message:
                    `Only ${product.stock} items are available`
            });
        }


        const cart = await Cart.findOne({
            user: req.user._id
        });


        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }


        const item = cart.items.find(
            (cartItem) =>
                cartItem.product.toString() ===
                productId.toString()
        );


        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product is not in your cart"
            });
        }


        item.quantity = newQuantity;


        await cart.save();


        const updatedCart =
            await Cart.findById(cart._id)
                .populate({
                    path: "items.product",
                    select:
                        "name slug price discountPrice images stock brand category",
                    populate: {
                        path: "category",
                        select: "name slug"
                    }
                });


        res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart: updatedCart
        });

    } catch (error) {
        console.error("Update Cart Error:", error);

        res.status(500).json({
            success: false,
            message:
                "Server error while updating cart"
        });
    }
};


// ==========================================
// REMOVE CART ITEM
// ==========================================

export const removeCartItem = async (req, res) => {
    try {
        const {
            productId
        } = req.params;


        const cart = await Cart.findOne({
            user: req.user._id
        });


        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }


        const itemExists = cart.items.some(
            (item) =>
                item.product.toString() ===
                productId.toString()
        );


        if (!itemExists) {
            return res.status(404).json({
                success: false,
                message: "Product is not in your cart"
            });
        }


        cart.items =
            cart.items.filter(
                (item) =>
                    item.product.toString() !==
                    productId.toString()
            );


        await cart.save();


        res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart
        });

    } catch (error) {
        console.error("Remove Cart Error:", error);

        res.status(500).json({
            success: false,
            message:
                "Server error while removing product"
        });
    }
};


// ==========================================
// CLEAR CART
// ==========================================

export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user._id
        });


        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }


        cart.items = [];

        await cart.save();


        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart
        });

    } catch (error) {
        console.error("Clear Cart Error:", error);

        res.status(500).json({
            success: false,
            message:
                "Server error while clearing cart"
        });
    }
};