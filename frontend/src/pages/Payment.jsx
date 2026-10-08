import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Payment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    // Load Razorpay script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement("script");

            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);

            document.body.appendChild(script);
        });
    };

    // Get order
    const fetchOrder = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/orders/${orderId}`);

            if (response.data.success) {
                setOrder(response.data.order);
            }
        } catch (error) {
            console.error(
                "Fetch order error:",
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
        if (authLoading) return;

        if (!user) {
            navigate("/login");
            return;
        }

        if (!orderId) {
            navigate("/cart");
            return;
        }

        fetchOrder();
    }, [user, authLoading, orderId]);

    // Start Razorpay payment
    const handlePayment = async () => {
        try {
            setProcessing(true);
            setError("");

            // Load Razorpay
            const razorpayLoaded =
                await loadRazorpayScript();

            if (!razorpayLoaded) {
                setError(
                    "Razorpay SDK failed to load. Please check your internet connection."
                );
                setProcessing(false);
                return;
            }

            // Create Razorpay order from backend
            const response = await api.post(
                "/payments/razorpay/create-order",
                {
                    orderId
                }
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Unable to create payment"
                );
            }

            const razorpayData =
                response.data.razorpay;

            // Razorpay checkout options
            const options = {
                key: razorpayData.keyId,

                amount: razorpayData.amount,

                currency: razorpayData.currency,

                name: "Shopora",

                description:
                    `Payment for Order ${response.data.order.orderNumber}`,

                order_id: razorpayData.orderId,

                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: order?.shippingAddress?.phone || ""
                },

                notes: {
                    orderId: orderId
                },

                theme: {
                    color: "#111827"
                },

                handler: async (paymentResponse) => {
                    try {
                        setProcessing(true);

                        // Verify payment on backend
                        const verifyResponse =
                            await api.post(
                                "/payments/razorpay/verify",
                                {
                                    orderId,

                                    razorpay_order_id:
                                        paymentResponse.razorpay_order_id,

                                    razorpay_payment_id:
                                        paymentResponse.razorpay_payment_id,

                                    razorpay_signature:
                                        paymentResponse.razorpay_signature
                                }
                            );

                        if (
                            verifyResponse.data.success
                        ) {
                            navigate(
                                `/order-success/${orderId}`
                            );
                        } else {
                            setError(
                                verifyResponse.data.message ||
                                "Payment verification failed"
                            );
                        }
                    } catch (error) {
                        console.error(
                            "Payment verification error:",
                            error.response?.data ||
                            error.message
                        );

                        setError(
                            error.response?.data?.message ||
                            "Payment verification failed"
                        );
                    } finally {
                        setProcessing(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setProcessing(false);
                    }
                }
            };

            const razorpay =
                new window.Razorpay(options);

            razorpay.on(
                "payment.failed",
                (response) => {
                    console.error(
                        "Payment failed:",
                        response.error
                    );

                    setError(
                        response.error?.description ||
                        "Payment failed. Please try again."
                    );

                    setProcessing(false);
                }
            );

            razorpay.open();
        } catch (error) {
            console.error(
                "Payment error:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Unable to start payment"
            );

            setProcessing(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4">
                <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                    <p className="text-sm font-medium text-red-600">
                        {error}
                    </p>

                    <button
                        onClick={() => navigate("/cart")}
                        className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
                    >
                        Back to Cart
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/checkout")}
                        className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Checkout
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Secure Payment
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Complete your payment securely using Razorpay.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

                    {/* Payment information */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <div className="mb-6 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                                <CreditCard className="h-6 w-6 text-gray-800" />
                            </div>

                            <div>
                                <h2 className="font-semibold text-gray-900">
                                    Razorpay Payment
                                </h2>

                                <p className="text-sm text-gray-500">
                                    UPI, Cards, Net Banking & Wallets
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-gray-100 pt-5">

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Order Number
                                </span>

                                <span className="text-sm font-semibold text-gray-900">
                                    {order?.orderNumber}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Payment Status
                                </span>

                                <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                                    Pending
                                </span>
                            </div>

                        </div>

                        {error && (
                            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="mt-8 rounded-xl bg-gray-50 p-4">
                            <div className="flex gap-3">
                                <ShieldCheck className="h-5 w-5 shrink-0 text-green-600" />

                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        Secure Payment
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        Your payment is securely processed by Razorpay.
                                        We never store your card or banking details.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-5 w-5" />
                                    Pay ₹{order?.totalAmount?.toLocaleString("en-IN")}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <h2 className="text-lg font-bold text-gray-900">
                            Order Summary
                        </h2>

                        <div className="mt-6 space-y-4">

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Subtotal
                                </span>

                                <span className="font-medium text-gray-900">
                                    ₹{order?.subtotal?.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Shipping
                                </span>

                                <span className="font-medium text-gray-900">
                                    {order?.shippingCharge === 0
                                        ? "FREE"
                                        : `₹${order?.shippingCharge?.toLocaleString("en-IN")}`}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Tax
                                </span>

                                <span className="font-medium text-gray-900">
                                    ₹{order?.tax?.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900">
                                        Total
                                    </span>

                                    <span className="text-xl font-bold text-gray-900">
                                        ₹{order?.totalAmount?.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Address */}
                        <div className="mt-6 border-t border-gray-100 pt-5">
                            <p className="text-sm font-semibold text-gray-900">
                                Delivery Address
                            </p>

                            <div className="mt-2 text-sm leading-6 text-gray-500">
                                <p className="font-medium text-gray-800">
                                    {order?.shippingAddress?.fullName}
                                </p>

                                <p>
                                    {order?.shippingAddress?.addressLine1}
                                </p>

                                {order?.shippingAddress?.addressLine2 && (
                                    <p>
                                        {order.shippingAddress.addressLine2}
                                    </p>
                                )}

                                <p>
                                    {order?.shippingAddress?.city},{" "}
                                    {order?.shippingAddress?.state}{" "}
                                    {order?.shippingAddress?.postalCode}
                                </p>

                                <p>
                                    {order?.shippingAddress?.phone}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;