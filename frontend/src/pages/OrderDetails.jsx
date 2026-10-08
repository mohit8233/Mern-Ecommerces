import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Package,
    Truck,
    MapPin,
    CreditCard,
    XCircle,
    Loader2,
    ShoppingBag
} from "lucide-react";

import api from "../services/api";

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);

    // FETCH ORDER
    const fetchOrder = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/orders/${orderId}`
            );

            if (response.data.success) {
                setOrder(response.data.order);
            }
        } catch (error) {
            console.error(
                "Order details error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to load order"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    // CANCEL ORDER / REFUND
    const handleCancelOrder = async () => {
        const isPaid = order.paymentStatus === "paid";

        const confirmed = window.confirm(
            isPaid
                ? "Are you sure you want to cancel this order? Your payment refund will be initiated."
                : "Are you sure you want to cancel this order?"
        );

        if (!confirmed) return;

        try {
            setCancelling(true);

            let response;

            if (isPaid) {
                // PAID ORDER → RAZORPAY REFUND
                response = await api.post(
                    "/payments/razorpay/refund",
                    {
                        orderId,
                        reason: "Cancelled by customer"
                    }
                );
            } else {
                // COD / UNPAID ORDER → NORMAL CANCEL
                response = await api.patch(
                    `/orders/${orderId}/cancel`,
                    {
                        reason: "Cancelled by customer"
                    }
                );
            }

            if (response.data.success) {
                setOrder(response.data.order);

                alert(
                    isPaid
                        ? "Order cancelled successfully. Refund has been initiated."
                        : "Order cancelled successfully."
                );
            }
        } catch (error) {
            console.error(
                "Cancel order error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to cancel order"
            );
        } finally {
            setCancelling(false);
        }
    };

    // TRACKING STATUS
    const getStepStatus = (step) => {
        if (!order) {
            return "upcoming";
        }

        const statusOrder = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered"
        ];

        const currentIndex =
            statusOrder.indexOf(order.orderStatus);

        const stepIndex =
            statusOrder.indexOf(step);

        if (order.orderStatus === "cancelled") {
            return "cancelled";
        }

        if (stepIndex <= currentIndex) {
            return "completed";
        }

        return "upcoming";
    };

    // TRACKING STEPS
    const trackingSteps = [
        {
            key: "pending",
            title: "Order Placed",
            description: "Your order has been placed.",
            icon: Clock3
        },
        {
            key: "confirmed",
            title: "Confirmed",
            description: "Your order has been confirmed.",
            icon: CheckCircle2
        },
        {
            key: "processing",
            title: "Processing",
            description: "Your order is being prepared.",
            icon: Package
        },
        {
            key: "shipped",
            title: "Shipped",
            description: "Your order is on the way.",
            icon: Truck
        },
        {
            key: "delivered",
            title: "Delivered",
            description: "Your order has been delivered.",
            icon: CheckCircle2
        }
    ];

    // LOADING
    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
            </div>
        );
    }

    // ERROR
    if (error || !order) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-red-600">
                        {error || "Order not found"}
                    </p>

                    <Link
                        to="/orders"
                        className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
                    >
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const isCancelled =
        order.orderStatus === "cancelled";

    const isDelivered =
        order.orderStatus === "delivered";

    const canCancel =
        !isCancelled && !isDelivered;

    const isPaid =
        order.paymentStatus === "paid";

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* HEADER */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/orders")}
                        className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Orders
                    </button>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Order Details
                            </p>

                            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                                {order.orderNumber}
                            </h1>
                        </div>

                        <div className="flex flex-wrap gap-2">

                            {/* PAYMENT STATUS */}
                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                                    order.paymentStatus === "paid"
                                        ? "bg-green-50 text-green-700"
                                        : order.paymentStatus === "refunded"
                                        ? "bg-orange-50 text-orange-700"
                                        : order.paymentStatus === "failed"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                Payment: {order.paymentStatus}
                            </span>

                            {/* ORDER STATUS */}
                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                                    order.orderStatus === "cancelled"
                                        ? "bg-red-50 text-red-700"
                                        : order.orderStatus === "delivered"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {order.orderStatus}
                            </span>
                        </div>
                    </div>
                </div>

                {/* CANCELLED MESSAGE */}
                {isCancelled && (
                    <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
                        <XCircle className="h-6 w-6 shrink-0 text-red-600" />

                        <div>
                            <p className="font-semibold text-red-800">
                                Order Cancelled
                            </p>

                            <p className="mt-1 text-sm text-red-600">
                                {order.cancelReason ||
                                    "This order has been cancelled."}
                            </p>

                            {/* REFUND MESSAGE */}
                            {order.paymentStatus === "refunded" && (
                                <p className="mt-2 text-sm font-semibold text-green-700">
                                    Refund has been initiated successfully.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* TRACKING */}
                {!isCancelled && (
                    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900">
                            Track Order
                        </h2>

                        <div className="mt-8">
                            {trackingSteps.map(
                                (step, index) => {
                                    const status =
                                        getStepStatus(
                                            step.key
                                        );

                                    const Icon =
                                        step.icon;

                                    return (
                                        <div
                                            key={step.key}
                                            className="relative flex gap-4"
                                        >

                                            {/* CONNECTING LINE */}
                                            {index <
                                                trackingSteps.length -
                                                    1 && (
                                                <div
                                                    className={`absolute left-5 top-10 h-full w-0.5 ${
                                                        status ===
                                                            "completed" &&
                                                        getStepStatus(
                                                            trackingSteps[
                                                                index + 1
                                                            ].key
                                                        ) ===
                                                            "completed"
                                                            ? "bg-black"
                                                            : "bg-gray-200"
                                                    }`}
                                                />
                                            )}

                                            {/* ICON */}
                                            <div
                                                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                                    status ===
                                                    "completed"
                                                        ? "bg-black text-white"
                                                        : "bg-gray-100 text-gray-400"
                                                }`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            {/* TEXT */}
                                            <div className="pb-8">
                                                <p
                                                    className={`font-semibold ${
                                                        status ===
                                                        "completed"
                                                            ? "text-gray-900"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    {step.title}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

                    {/* ORDER ITEMS */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
                            <ShoppingBag className="h-5 w-5" />

                            <h2 className="text-lg font-bold">
                                Order Items
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <div
                                    key={item.product}
                                    className="flex gap-4 py-5"
                                >

                                    {/* IMAGE */}
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* INFO */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {item.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            ₹
                                            {item.price.toLocaleString(
                                                "en-IN"
                                            )}{" "}
                                            × {item.quantity}
                                        </p>

                                        <p className="mt-2 font-bold text-gray-900">
                                            ₹
                                            {item.total.toLocaleString(
                                                "en-IN"
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="space-y-6">

                        {/* PAYMENT SUMMARY */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                            <h2 className="text-lg font-bold">
                                Payment Summary
                            </h2>

                            <div className="mt-5 space-y-3 text-sm">

                                {/* SUBTOTAL */}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Subtotal
                                    </span>

                                    <span>
                                        ₹
                                        {order.subtotal.toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>
                                </div>

                                {/* SHIPPING */}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Shipping
                                    </span>

                                    <span>
                                        {order.shippingCharge === 0
                                            ? "FREE"
                                            : `₹${order.shippingCharge.toLocaleString(
                                                  "en-IN"
                                              )}`}
                                    </span>
                                </div>

                                {/* TAX */}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Tax
                                    </span>

                                    <span>
                                        ₹
                                        {order.tax.toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>
                                </div>

                                {/* TOTAL */}
                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>
                                            Total
                                        </span>

                                        <span>
                                            ₹
                                            {order.totalAmount.toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* PAYMENT METHOD */}
                            <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-5">
                                <CreditCard className="h-5 w-5" />

                                <div>
                                    <p className="text-sm font-semibold">
                                        Payment Method
                                    </p>

                                    <p className="text-sm capitalize text-gray-500">
                                        {order.paymentMethod}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* DELIVERY ADDRESS */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex gap-3">

                                <MapPin className="h-5 w-5 shrink-0" />

                                <div className="text-sm leading-6 text-gray-500">

                                    <h2 className="font-bold text-gray-900">
                                        Delivery Address
                                    </h2>

                                    <p className="mt-2 font-medium text-gray-800">
                                        {
                                            order.shippingAddress
                                                .fullName
                                        }
                                    </p>

                                    <p>
                                        {
                                            order.shippingAddress
                                                .addressLine1
                                        }
                                    </p>

                                    {order.shippingAddress
                                        .addressLine2 && (
                                        <p>
                                            {
                                                order.shippingAddress
                                                    .addressLine2
                                            }
                                        </p>
                                    )}

                                    <p>
                                        {
                                            order.shippingAddress
                                                .city
                                        }
                                        ,{" "}
                                        {
                                            order.shippingAddress
                                                .state
                                        }{" "}
                                        {
                                            order.shippingAddress
                                                .postalCode
                                        }
                                    </p>

                                    <p>
                                        {
                                            order.shippingAddress
                                                .phone
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CANCEL ORDER */}
                        {canCancel && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {cancelling ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />

                                        {isPaid
                                            ? "Processing Refund..."
                                            : "Cancelling..."}
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4" />

                                        {isPaid
                                            ? "Cancel & Refund"
                                            : "Cancel Order"}
                                    </>
                                )}
                            </button>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;