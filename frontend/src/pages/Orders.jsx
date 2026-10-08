import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Package,
    Eye,
    ShoppingBag,
    Loader2,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import api from "../services/api";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/orders/my-orders?page=${page}&limit=10`
            );

            if (response.data.success) {
                setOrders(response.data.orders || []);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error(
                "Orders error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to load your orders"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const getStatusClass = (status) => {
        const classes = {
            pending: "bg-yellow-50 text-yellow-700",
            confirmed: "bg-blue-50 text-blue-700",
            processing: "bg-purple-50 text-purple-700",
            shipped: "bg-indigo-50 text-indigo-700",
            delivered: "bg-green-50 text-green-700",
            cancelled: "bg-red-50 text-red-700"
        };

        return classes[status] || "bg-gray-100 text-gray-700";
    };

    const getPaymentClass = (status) => {
        const classes = {
            pending: "bg-yellow-50 text-yellow-700",
            paid: "bg-green-50 text-green-700",
            failed: "bg-red-50 text-red-700",
            refunded: "bg-purple-50 text-purple-700"
        };

        return classes[status] || "bg-gray-100 text-gray-700";
    };

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <Package className="h-7 w-7 text-gray-900" />

                        <h1 className="text-3xl font-bold text-gray-900">
                            My Orders
                        </h1>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                        Track and manage your orders.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                )}

                {/* Empty */}
                {!error && orders.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <ShoppingBag className="h-7 w-7 text-gray-500" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-gray-900">
                            No Orders Yet
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            You haven't placed any orders yet.
                        </p>

                        <Link
                            to="/shop"
                            className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                            Start Shopping
                        </Link>
                    </div>
                )}

                {/* Orders */}
                <div className="space-y-5">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                        >
                            {/* Order Header */}
                            <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Order Number
                                    </p>

                                    <p className="mt-1 font-bold text-gray-900">
                                        {order.orderNumber}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                                            order.orderStatus
                                        )}`}
                                    >
                                        {order.orderStatus}
                                    </span>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPaymentClass(
                                            order.paymentStatus
                                        )}`}
                                    >
                                        Payment: {order.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Order Body */}
                            <div className="p-5">

                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                    {/* Items */}
                                    <div className="flex min-w-0 flex-1 items-center">
                                        <div className="flex -space-x-3">
                                            {order.items
                                                .slice(0, 4)
                                                .map((item, index) => (
                                                    <div
                                                        key={`${item.product}-${index}`}
                                                        className="h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-gray-100"
                                                    >
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>

                                        <div className="ml-5 min-w-0">
                                            <p className="font-semibold text-gray-900">
                                                {order.items.length}{" "}
                                                {order.items.length === 1
                                                    ? "Product"
                                                    : "Products"}
                                            </p>

                                            <p className="mt-1 truncate text-sm text-gray-500">
                                                {order.items
                                                    .map(
                                                        (item) =>
                                                            item.name
                                                    )
                                                    .join(", ")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Ordered On
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                }
                                            )}
                                        </p>
                                    </div>

                                    {/* Total */}
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Total
                                        </p>

                                        <p className="mt-1 text-lg font-bold text-gray-900">
                                            ₹
                                            {order.totalAmount.toLocaleString(
                                                "en-IN"
                                            )}
                                        </p>
                                    </div>

                                    {/* View */}
                                    <Link
                                        to={`/orders/${order._id}`}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </Link>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {pagination &&
                    pagination.totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-4">

                            <button
                                onClick={() =>
                                    setPage((prev) =>
                                        Math.max(prev - 1, 1)
                                    )
                                }
                                disabled={page === 1}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <span className="text-sm font-medium text-gray-600">
                                Page {pagination.currentPage} of{" "}
                                {pagination.totalPages}
                            </span>

                            <button
                                onClick={() =>
                                    setPage((prev) =>
                                        Math.min(
                                            prev + 1,
                                            pagination.totalPages
                                        )
                                    )
                                }
                                disabled={
                                    page ===
                                    pagination.totalPages
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>

                        </div>
                    )}
            </div>
        </div>
    );
};

export default Orders;