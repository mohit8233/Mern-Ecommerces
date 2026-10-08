import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [2, "Product name must be at least 2 characters"],
            maxlength: [150, "Product name cannot exceed 150 characters"]
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        shortDescription: {
            type: String,
            trim: true,
            maxlength: [300, "Short description cannot exceed 300 characters"],
            default: ""
        },

        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true
        },

        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Price cannot be negative"]
        },

        discountPrice: {
            type: Number,
            default: null,
            min: [0, "Discount price cannot be negative"]
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"]
        },

        brand: {
            type: String,
            trim: true,
            default: ""
        },

        sku: {
            type: String,
            required: [true, "SKU is required"],
            unique: true,
            uppercase: true,
            trim: true
        },

        images: [
            {
                type: String,
                trim: true
            }
        ],

        stock: {
            type: Number,
            required: [true, "Stock is required"],
            min: [0, "Stock cannot be negative"],
            default: 0
        },

        soldCount: {
            type: Number,
            default: 0,
            min: 0
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        numReviews: {
            type: Number,
            default: 0,
            min: 0
        },

        featured: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;