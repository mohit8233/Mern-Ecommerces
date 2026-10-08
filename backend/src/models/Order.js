import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            default: ""
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        total: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: false
    }
);

const shippingAddressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        addressLine1: {
            type: String,
            required: true
        },

        addressLine2: {
            type: String,
            default: ""
        },

        city: {
            type: String,
            required: true
        },

        state: {
            type: String,
            required: true
        },

        postalCode: {
            type: String,
            required: true
        },

        country: {
            type: String,
            default: "India"
        },

        landmark: {
            type: String,
            default: ""
        }
    },
    {
        _id: false
    }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Order must contain at least one item"
            }
        },

        shippingAddress: {
            type: shippingAddressSchema,
            required: true
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        shippingCharge: {
            type: Number,
            default: 0,
            min: 0
        },

        tax: {
            type: Number,
            default: 0,
            min: 0
        },

        discount: {
            type: Number,
            default: 0,
            min: 0
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: ["razorpay", "cod"],
            default: "razorpay"
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending"
        },

        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "pending"
        },

        razorpayOrderId: {
            type: String,
            default: ""
        },

        razorpayPaymentId: {
            type: String,
            default: ""
        },
         razorpayRefundId: {
    type: String,
    default: null
},

refundAmount: {
    type: Number,
    default: 0
},

refundedAt: {
    type: Date,
    default: null
},

refundReason: {
    type: String,
    default: null,
    trim: true,
    maxlength: 500
},
        paidAt: {
            type: Date,
            default: null
        },

        deliveredAt: {
            type: Date,
            default: null
        },

        cancelledAt: {
            type: Date,
            default: null
        },

        cancelReason: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;