import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    CheckCircle2,
    Package,
    ShoppingBag,
    ArrowRight,
    MapPin,
    CreditCard,
    Loader2
} from "lucide-react";
import api from "../services/api";

const OrderSuccess = () => {
    const { orderId } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(
                    `/orders/${orderId}`
                );

                if (response.data.success) {
                    setOrder(response.data.order);
                }
            } catch (error) {
                console.error(
                    "Order fetch error:",
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

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-red-600">
                        {error || "Order not found"}
                    </p>

                    <Link
                        to="/shop"
                        className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">

                {/* Success */}
                <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-11 w-11 text-green-600" />
                    </div>

                    <h1 className="mt-6 text-3xl font-bold text-gray-900">
                        Order Placed Successfully!
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Thank you for shopping with Shopora.
                    </p>

                    <p className="mt-3 text-sm text-gray-600">
                        Order Number:{" "}
                        <span className="font-semibold text-gray-900">
                            {order.orderNumber}
                        </span>
                    </p>
                </div>

                {/* Main */}
                <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">

                    {/* Products */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
                            <Package className="h-5 w-5" />

                            <h2 className="text-lg font-bold">
                                Ordered Items
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <div
                                    key={item.product}
                                    className="flex gap-4 py-5"
                                >
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <ShoppingBag className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {item.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Qty: {item.quantity}
                                        </p>

                                        <p className="mt-2 font-semibold">
                                            ₹{item.total.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <h2 className="text-lg font-bold">
                            Order Summary
                        </h2>

                        <div className="mt-5 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Subtotal
                                </span>

                                <span>
                                    ₹{order.subtotal.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Shipping
                                </span>

                                <span>
                                    {order.shippingCharge === 0
                                        ? "FREE"
                                        : `₹${order.shippingCharge.toLocaleString("en-IN")}`}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Tax
                                </span>

                                <span>
                                    ₹{order.tax.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>

                                    <span>
                                        ₹{order.totalAmount.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="mt-6 border-t border-gray-100 pt-5">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5" />

                                <div>
                                    <p className="text-sm font-semibold">
                                        Payment
                                    </p>

                                    <p className="text-sm capitalize text-gray-500">
                                        {order.paymentMethod}
                                    </p>
                                </div>

                                <span className="ml-auto rounded-full bg-green-50 px-3 py-1 text-xs font-semibold capitalize text-green-700">
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="mt-6 border-t border-gray-100 pt-5">
                            <div className="flex gap-3">
                                <MapPin className="h-5 w-5 shrink-0" />

                                <div className="text-sm leading-6 text-gray-500">
                                    <p className="font-semibold text-gray-900">
                                        Delivery Address
                                    </p>

                                    <p className="mt-1">
                                        {order.shippingAddress.fullName}
                                    </p>

                                    <p>
                                        {order.shippingAddress.addressLine1}
                                    </p>

                                    <p>
                                        {order.shippingAddress.city},{" "}
                                        {order.shippingAddress.state}{" "}
                                        {order.shippingAddress.postalCode}
                                    </p>

                                    <p>
                                        {order.shippingAddress.phone}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                    <Link
                        to="/orders"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                        View My Orders
                        <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                        to="/shop"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Continue Shopping
                    </Link>

                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;