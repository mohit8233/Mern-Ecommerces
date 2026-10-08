import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: [2, "Full name must be at least 2 characters"],
            maxlength: [100, "Full name cannot exceed 100 characters"]
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },

        addressLine1: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
            maxlength: [200, "Address cannot exceed 200 characters"]
        },

        addressLine2: {
            type: String,
            trim: true,
            default: ""
        },

        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },

        state: {
            type: String,
            required: [true, "State is required"],
            trim: true
        },

        postalCode: {
            type: String,
            required: [true, "Postal code is required"],
            trim: true
        },

        country: {
            type: String,
            required: [true, "Country is required"],
            trim: true,
            default: "India"
        },

        landmark: {
            type: String,
            trim: true,
            default: ""
        },

        addressType: {
            type: String,
            enum: ["home", "work", "other"],
            default: "home"
        },

        isDefault: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Address = mongoose.model("Address", addressSchema);

export default Address;