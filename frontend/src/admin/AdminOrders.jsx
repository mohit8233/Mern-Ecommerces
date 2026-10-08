import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Search,
    SlidersHorizontal,
    RefreshCw,
    Eye,
    Package,
    User,
    IndianRupee,
    ChevronLeft,
    ChevronRight,
    X,
    CheckCircle2,
    Clock3,
    Truck,
    XCircle,
    Loader2,
    RotateCcw,
    AlertTriangle
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminOrders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false
    });

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [status, setStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [sort, setSort] = useState("latest");
    const [limit, setLimit] = useState(10);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [showFilters, setShowFilters] = useState(false);

    const [showCancelModal, setShowCancelModal] =
        useState(false);

    const [showRefundModal, setShowRefundModal] =
        useState(false);

    const [cancelReason, setCancelReason] = useState(
        "Cancelled by admin"
    );

    const [refundReason, setRefundReason] = useState(
        "Refund initiated by admin"
    );

    // ==========================================
    // AUTH CHECK
    // ==========================================

    useEffect(() => {
        if (!user) return;

        if (user.role !== "admin") {
            navigate("/dashboard", {
                replace: true
            });
        }
    }, [user, navigate]);

    // ==========================================
    // FETCH ORDERS
    // ==========================================

    const fetchOrders = async (
        page = pagination.currentPage
    ) => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            params.append("page", page);
            params.append("limit", limit);

            if (status) {
                params.append("status", status);
            }

            if (paymentStatus) {
                params.append(
                    "paymentStatus",
                    paymentStatus
                );
            }

            if (search.trim()) {
                params.append(
                    "search",
                    search.trim()
                );
            }

            params.append("sort", sort);

            const response = await api.get(
                `/admin/orders?${params.toString()}`
            );

            if (response.data.success) {
                setOrders(response.data.orders || []);

                setPagination(
                    response.data.pagination || {
                        currentPage: page,
                        totalPages: 1,
                        totalOrders: 0,
                        limit,
                        hasNextPage: false,
                        hasPreviousPage: false
                    }
                );
            }
        } catch (error) {
            console.error(
                "Admin Orders Error:",
                error.response?.data ||
                    error.message
            );

            setError(
                error.response?.data?.message ||
                    "Failed to load orders"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "admin") {
            fetchOrders(1);
        }
    }, [
        user,
        status,
        paymentStatus,
        sort,
        limit,
        search
    ]);

    // ==========================================
    // SEARCH
    // ==========================================

    const handleSearch = (e) => {
        e.preventDefault();

        setSearch(searchInput.trim());
    };

    const clearSearch = () => {
        setSearchInput("");
        setSearch("");
    };

    // ==========================================
    // RESET FILTERS
    // ==========================================

    const resetFilters = () => {
        setSearchInput("");
        setSearch("");
        setStatus("");
        setPaymentStatus("");
        setSort("latest");
        setLimit(10);
    };

    // ==========================================
    // GET SINGLE ORDER
    // ==========================================

    const openOrderDetails = async (orderId) => {
        try {
            setDetailsLoading(true);
            setSelectedOrder(null);

            const response = await api.get(
                `/admin/orders/${orderId}`
            );

            if (response.data.success) {
                setSelectedOrder(
                    response.data.order
                );
            }
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Unable to fetch order details"
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================

    const handleStatusChange = async (
        orderId,
        orderStatus
    ) => {
        try {
            setActionLoading(
                `status-${orderId}`
            );

            const response = await api.patch(
                `/admin/orders/${orderId}/status`,
                {
                    orderStatus
                }
            );

            if (response.data.success) {
                setOrders((previousOrders) =>
                    previousOrders.map((order) =>
                        order._id === orderId
                            ? {
                                  ...order,
                                  orderStatus:
                                      response.data
                                          .order
                                          .orderStatus
                              }
                            : order
                    )
                );

                if (
                    selectedOrder?._id ===
                    orderId
                ) {
                    setSelectedOrder(
                        response.data.order
                    );
                }
            }
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Unable to update order status"
            );
        } finally {
            setActionLoading("");
        }
    };

    // ==========================================
    // CANCEL ORDER
    // ==========================================

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;

        try {
            setActionLoading(
                `cancel-${selectedOrder._id}`
            );

            const response = await api.patch(
                `/admin/orders/${selectedOrder._id}/cancel`,
                {
                    reason:
                        cancelReason.trim() ||
                        "Cancelled by admin"
                }
            );

            if (response.data.success) {
                setSelectedOrder(
                    response.data.order
                );

                setShowCancelModal(false);

                await fetchOrders(
                    pagination.currentPage
                );

                alert(
                    "Order cancelled successfully"
                );
            }
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Unable to cancel order"
            );
        } finally {
            setActionLoading("");
        }
    };

    // ==========================================
    // REFUND ORDER
    // ==========================================

    const handleRefundOrder = async () => {
        if (!selectedOrder) return;

        try {
            setActionLoading(
                `refund-${selectedOrder._id}`
            );

            const response = await api.post(
                `/admin/orders/${selectedOrder._id}/refund`,
                {
                    reason:
                        refundReason.trim() ||
                        "Refund initiated by admin"
                }
            );

            if (response.data.success) {
                setSelectedOrder(
                    response.data.order
                );

                setShowRefundModal(false);

                await fetchOrders(
                    pagination.currentPage
                );

                alert(
                    "Refund initiated successfully"
                );
            }
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Refund failed"
            );
        } finally {
            setActionLoading("");
        }
    };

    // ==========================================
    // STATUS STYLES
    // ==========================================

    const getStatusClass = (orderStatus) => {
        switch (orderStatus) {
            case "pending":
                return "bg-yellow-50 text-yellow-700";

            case "confirmed":
                return "bg-purple-50 text-purple-700";

            case "processing":
                return "bg-orange-50 text-orange-700";

            case "shipped":
                return "bg-blue-50 text-blue-700";

            case "delivered":
                return "bg-green-50 text-green-700";

            case "cancelled":
                return "bg-red-50 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getPaymentClass = (paymentStatus) => {
        switch (paymentStatus) {
            case "paid":
                return "bg-green-50 text-green-700";

            case "refunded":
                return "bg-orange-50 text-orange-700";

            case "failed":
                return "bg-red-50 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusIcon = (orderStatus) => {
        switch (orderStatus) {
            case "pending":
                return Clock3;

            case "confirmed":
                return CheckCircle2;

            case "processing":
                return Package;

            case "shipped":
                return Truck;

            case "delivered":
                return CheckCircle2;

            case "cancelled":
                return XCircle;

            default:
                return Clock3;
        }
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const formatDateTime = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading && orders.length === 0) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
                <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="h-7 w-7 animate-spin" />

                    <span className="text-sm font-medium">
                        Loading orders...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* ======================================
                    HEADER
                ====================================== */}

                <div className="mb-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Admin Panel
                            </p>

                            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                                Orders
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Manage customer orders,
                                payments and delivery status.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                fetchOrders(
                                    pagination.currentPage
                                )
                            }
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />

                            Refresh
                        </button>
                    </div>
                </div>

                {/* ======================================
                    SEARCH + FILTERS
                ====================================== */}

                <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">

                    <div className="flex flex-col gap-3 lg:flex-row">

                        {/* Search */}
                        <form
                            onSubmit={handleSearch}
                            className="flex flex-1 gap-2"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) =>
                                        setSearchInput(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search by order number..."
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                                />

                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Search
                            </button>
                        </form>

                        {/* Filter Toggle */}
                        <button
                            onClick={() =>
                                setShowFilters(
                                    !showFilters
                                )
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-gray-400"
                        >
                            <SlidersHorizontal className="h-4 w-4" />

                            Filters
                        </button>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">

                            {/* Order Status */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Order Status
                                </label>

                                <select
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(
                                            e.target.value
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
                                >
                                    <option value="">
                                        All Status
                                    </option>

                                    <option value="pending">
                                        Pending
                                    </option>

                                    <option value="confirmed">
                                        Confirmed
                                    </option>

                                    <option value="processing">
                                        Processing
                                    </option>

                                    <option value="shipped">
                                        Shipped
                                    </option>

                                    <option value="delivered">
                                        Delivered
                                    </option>

                                    <option value="cancelled">
                                        Cancelled
                                    </option>
                                </select>
                            </div>

                            {/* Payment Status */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Payment
                                </label>

                                <select
                                    value={
                                        paymentStatus
                                    }
                                    onChange={(e) =>
                                        setPaymentStatus(
                                            e.target.value
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
                                >
                                    <option value="">
                                        All Payments
                                    </option>

                                    <option value="pending">
                                        Pending
                                    </option>

                                    <option value="paid">
                                        Paid
                                    </option>

                                    <option value="failed">
                                        Failed
                                    </option>

                                    <option value="refunded">
                                        Refunded
                                    </option>
                                </select>
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Sort
                                </label>

                                <select
                                    value={sort}
                                    onChange={(e) =>
                                        setSort(
                                            e.target.value
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
                                >
                                    <option value="latest">
                                        Latest
                                    </option>

                                    <option value="oldest">
                                        Oldest
                                    </option>

                                    <option value="highest">
                                        Highest Amount
                                    </option>

                                    <option value="lowest">
                                        Lowest Amount
                                    </option>
                                </select>
                            </div>

                            {/* Limit */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Per Page
                                </label>

                                <select
                                    value={limit}
                                    onChange={(e) =>
                                        setLimit(
                                            Number(
                                                e.target
                                                    .value
                                            )
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
                                >
                                    <option value={10}>
                                        10
                                    </option>

                                    <option value={20}>
                                        20
                                    </option>

                                    <option value={50}>
                                        50
                                    </option>

                                    <option value={100}>
                                        100
                                    </option>
                                </select>
                            </div>

                            <div className="sm:col-span-2 lg:col-span-4">
                                <button
                                    onClick={
                                        resetFilters
                                    }
                                    className="text-sm font-semibold text-gray-500 hover:text-black"
                                >
                                    Reset all filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                        <AlertTriangle className="h-5 w-5 shrink-0" />

                        {error}
                    </div>
                )}

                {/* ======================================
                    ORDER COUNT
                ====================================== */}

                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing{" "}
                        <span className="font-semibold text-gray-900">
                            {orders.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-gray-900">
                            {pagination.totalOrders}
                        </span>{" "}
                        orders
                    </p>

                    {search && (
                        <p className="text-xs text-gray-500">
                            Search:{" "}
                            <span className="font-semibold text-gray-800">
                                {search}
                            </span>
                        </p>
                    )}
                </div>

                {/* ======================================
                    ORDERS TABLE
                ====================================== */}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    {orders.length > 0 ? (
                        <>
                            {/* Desktop */}
                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[1050px]">

                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50 text-left">
                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Order
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Customer
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Items
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Amount
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Payment
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">

                                        {orders.map(
                                            (order) => {
                                                const StatusIcon =
                                                    getStatusIcon(
                                                        order.orderStatus
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            order._id
                                                        }
                                                        className="transition hover:bg-gray-50"
                                                    >
                                                        {/* Order */}
                                                        <td className="px-5 py-5">
                                                            <p className="text-sm font-bold text-gray-900">
                                                                {
                                                                    order.orderNumber
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-400">
                                                                {formatDate(
                                                                    order.createdAt
                                                                )}
                                                            </p>
                                                        </td>

                                                        {/* Customer */}
                                                        <td className="px-5 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                                                    <User className="h-4 w-4 text-gray-500" />
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="max-w-36 truncate text-sm font-semibold text-gray-900">
                                                                        {
                                                                            order
                                                                                .user
                                                                                ?.name
                                                                        }
                                                                    </p>

                                                                    <p className="max-w-44 truncate text-xs text-gray-500">
                                                                        {
                                                                            order
                                                                                .user
                                                                                ?.email
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Items */}
                                                        <td className="px-5 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-4 w-4 text-gray-400" />

                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {
                                                                        order
                                                                            .items
                                                                            ?.length
                                                                    }{" "}
                                                                    items
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Amount */}
                                                        <td className="px-5 py-5">
                                                            <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                                                                <IndianRupee className="h-3.5 w-3.5" />

                                                                {Number(
                                                                    order.totalAmount ||
                                                                        0
                                                                ).toLocaleString(
                                                                    "en-IN"
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Payment */}
                                                        <td className="px-5 py-5">
                                                            <span
                                                                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentClass(
                                                                    order.paymentStatus
                                                                )}`}
                                                            >
                                                                {
                                                                    order.paymentStatus
                                                                }
                                                            </span>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-5 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <StatusIcon className="h-4 w-4 text-gray-500" />

                                                                <select
                                                                    value={
                                                                        order.orderStatus
                                                                    }
                                                                    disabled={
                                                                        actionLoading ===
                                                                        `status-${order._id}`
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleStatusChange(
                                                                            order._id,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className={`rounded-lg border-0 px-3 py-2 text-xs font-semibold capitalize outline-none ${getStatusClass(
                                                                        order.orderStatus
                                                                    )}`}
                                                                >
                                                                    <option value="pending">
                                                                        Pending
                                                                    </option>

                                                                    <option value="confirmed">
                                                                        Confirmed
                                                                    </option>

                                                                    <option value="processing">
                                                                        Processing
                                                                    </option>

                                                                    <option value="shipped">
                                                                        Shipped
                                                                    </option>

                                                                    <option value="delivered">
                                                                        Delivered
                                                                    </option>

                                                                    <option value="cancelled">
                                                                        Cancelled
                                                                    </option>
                                                                </select>
                                                            </div>
                                                        </td>

                                                        {/* Action */}
                                                        <td className="px-5 py-5">
                                                            <button
                                                                onClick={() =>
                                                                    openOrderDetails(
                                                                        order._id
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-black hover:text-black"
                                                            >
                                                                <Eye className="h-4 w-4" />

                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile / Tablet */}
                            <div className="divide-y divide-gray-100 lg:hidden">

                                {orders.map(
                                    (order) => (
                                        <div
                                            key={
                                                order._id
                                            }
                                            className="p-5"
                                        >
                                            <div className="flex items-start justify-between gap-3">

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold text-gray-900">
                                                        {
                                                            order.orderNumber
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {formatDate(
                                                            order.createdAt
                                                        )}
                                                    </p>
                                                </div>

                                                <p className="shrink-0 text-base font-bold text-gray-900">
                                                    ₹
                                                    {Number(
                                                        order.totalAmount ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>
                                            </div>

                                            {/* Customer */}
                                            <div className="mt-4 flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {
                                                            order
                                                                .user
                                                                ?.name
                                                        }
                                                    </p>

                                                    <p className="truncate text-xs text-gray-500">
                                                        {
                                                            order
                                                                .user
                                                                ?.email
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentClass(
                                                        order.paymentStatus
                                                    )}`}
                                                >
                                                    {
                                                        order.paymentStatus
                                                    }
                                                </span>

                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClass(
                                                        order.orderStatus
                                                    )}`}
                                                >
                                                    {
                                                        order.orderStatus
                                                    }
                                                </span>

                                                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                                                    {
                                                        order
                                                            .items
                                                            ?.length
                                                    }{" "}
                                                    items
                                                </span>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <select
                                                    value={
                                                        order.orderStatus
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        `status-${order._id}`
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleStatusChange(
                                                            order._id,
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold capitalize outline-none"
                                                >
                                                    <option value="pending">
                                                        Pending
                                                    </option>

                                                    <option value="confirmed">
                                                        Confirmed
                                                    </option>

                                                    <option value="processing">
                                                        Processing
                                                    </option>

                                                    <option value="shipped">
                                                        Shipped
                                                    </option>

                                                    <option value="delivered">
                                                        Delivered
                                                    </option>

                                                    <option value="cancelled">
                                                        Cancelled
                                                    </option>
                                                </select>

                                                <button
                                                    onClick={() =>
                                                        openOrderDetails(
                                                            order._id
                                                        )
                                                    }
                                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-xs font-semibold text-gray-700"
                                                >
                                                    <Eye className="h-4 w-4" />

                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}

                            </div>
                        </>
                    ) : (
                        <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                                <Package className="h-8 w-8 text-gray-400" />
                            </div>

                            <h3 className="mt-4 font-bold text-gray-900">
                                No orders found
                            </h3>

                            <p className="mt-2 max-w-sm text-sm text-gray-500">
                                Try changing your search or
                                filter settings.
                            </p>
                        </div>
                    )}
                </div>

                {/* ======================================
                    PAGINATION
                ====================================== */}

                {pagination.totalPages > 1 && (
                    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">

                        <p className="text-sm text-gray-500">
                            Page{" "}
                            <span className="font-semibold text-gray-900">
                                {
                                    pagination.currentPage
                                }
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-900">
                                {
                                    pagination.totalPages
                                }
                            </span>
                        </p>

                        <div className="flex items-center gap-2">

                            <button
                                disabled={
                                    !pagination.hasPreviousPage
                                }
                                onClick={() =>
                                    fetchOrders(
                                        pagination.currentPage -
                                            1
                                    )
                                }
                                className="flex h-10 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />

                                Previous
                            </button>

                            <button
                                disabled={
                                    !pagination.hasNextPage
                                }
                                onClick={() =>
                                    fetchOrders(
                                        pagination.currentPage +
                                            1
                                    )
                                }
                                className="flex h-10 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next

                                <ChevronRight className="h-4 w-4" />
                            </button>

                        </div>
                    </div>
                )}
            </div>

            {/* ==========================================
                ORDER DETAILS MODAL
            ========================================== */}

            {(detailsLoading ||
                selectedOrder) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-5">

                    <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* Modal Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">

                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Order Details
                                </p>

                                <h2 className="mt-1 text-lg font-bold text-gray-900">
                                    {selectedOrder
                                        ? selectedOrder.orderNumber
                                        : "Loading..."}
                                </h2>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedOrder(
                                        null
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Loading */}
                        {detailsLoading ? (
                            <div className="flex min-h-[400px] items-center justify-center">
                                <Loader2 className="h-7 w-7 animate-spin text-gray-500" />
                            </div>
                        ) : selectedOrder ? (
                            <div className="overflow-y-auto">

                                <div className="space-y-6 p-5 sm:p-6">

                                    {/* Order Summary */}
                                    <div className="grid gap-3 sm:grid-cols-3">

                                        <div className="rounded-xl bg-gray-50 p-4">
                                            <p className="text-xs text-gray-500">
                                                Order Date
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {formatDateTime(
                                                    selectedOrder.createdAt
                                                )}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-gray-50 p-4">
                                            <p className="text-xs text-gray-500">
                                                Payment Method
                                            </p>

                                            <p className="mt-1 text-sm font-semibold uppercase text-gray-900">
                                                {
                                                    selectedOrder.paymentMethod
                                                }
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-gray-50 p-4">
                                            <p className="text-xs text-gray-500">
                                                Total Amount
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-gray-900">
                                                ₹
                                                {Number(
                                                    selectedOrder.totalAmount ||
                                                        0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </p>
                                        </div>

                                    </div>

                                    {/* Customer */}
                                    <div className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-gray-500" />

                                            <h3 className="font-bold text-gray-900">
                                                Customer
                                            </h3>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Name
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                    {
                                                        selectedOrder
                                                            .user
                                                            ?.name
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Email
                                                </p>

                                                <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                                                    {
                                                        selectedOrder
                                                            .user
                                                            ?.email
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="rounded-xl border border-gray-200 p-4">
                                        <h3 className="font-bold text-gray-900">
                                            Shipping Address
                                        </h3>

                                        <div className="mt-3 text-sm leading-6 text-gray-600">
                                            <p className="font-semibold text-gray-900">
                                                {
                                                    selectedOrder
                                                        .shippingAddress
                                                        ?.fullName
                                                }
                                            </p>

                                            <p>
                                                {
                                                    selectedOrder
                                                        .shippingAddress
                                                        ?.phone
                                                }
                                            </p>

                                            <p>
                                                {
                                                    selectedOrder
                                                        .shippingAddress
                                                        ?.addressLine
                                                }
                                            </p>

                                            <p>
                                                {
                                                    selectedOrder
                                                        .shippingAddress
                                                        ?.city
                                                }
                                                ,{" "}
                                                {
                                                    selectedOrder
                                                        .shippingAddress
                                                        ?.state
                                                }
                                            </p>

                                            <p>
                                                {
                                                    selectedOrder
                                                        .shippingAddress
                                                        ?.postalCode
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Products */}
                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            Ordered Items
                                        </h3>

                                        <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200">

                                            {selectedOrder.items?.map(
                                                (
                                                    item,
                                                    index
                                                ) => {
                                                    const product =
                                                        item.product;

                                                    const image =
                                                        product
                                                            ?.images?.[0] ||
                                                        item.image;

                                                    return (
                                                        <div
                                                            key={
                                                                item._id ||
                                                                index
                                                            }
                                                            className="flex gap-4 p-4"
                                                        >
                                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                                {image ? (
                                                                    <img
                                                                        src={
                                                                            image
                                                                        }
                                                                        alt={
                                                                            item.name ||
                                                                            product?.name ||
                                                                            "Product"
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full items-center justify-center">
                                                                        <Package className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-semibold text-gray-900">
                                                                    {item.name ||
                                                                        product?.name ||
                                                                        "Product"}
                                                                </p>

                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    Qty:{" "}
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    Price: ₹
                                                                    {Number(
                                                                        item.price ||
                                                                            0
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <p className="shrink-0 text-sm font-bold text-gray-900">
                                                                ₹
                                                                {Number(
                                                                    (item.price ||
                                                                        0) *
                                                                        (item.quantity ||
                                                                            0)
                                                                ).toLocaleString(
                                                                    "en-IN"
                                                                )}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>
                                    </div>

                                    {/* Price Summary */}
                                    <div className="rounded-xl border border-gray-200 p-4">
                                        <h3 className="font-bold text-gray-900">
                                            Price Summary
                                        </h3>

                                        <div className="mt-4 space-y-3 text-sm">

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">
                                                    Subtotal
                                                </span>

                                                <span className="font-medium text-gray-900">
                                                    ₹
                                                    {Number(
                                                        selectedOrder.subtotal ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">
                                                    Shipping
                                                </span>

                                                <span className="font-medium text-gray-900">
                                                    ₹
                                                    {Number(
                                                        selectedOrder.shippingCharge ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">
                                                    Tax
                                                </span>

                                                <span className="font-medium text-gray-900">
                                                    ₹
                                                    {Number(
                                                        selectedOrder.tax ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">
                                                    Discount
                                                </span>

                                                <span className="font-medium text-gray-900">
                                                    -₹
                                                    {Number(
                                                        selectedOrder.discount ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex justify-between border-t border-gray-100 pt-3">
                                                <span className="font-bold text-gray-900">
                                                    Total
                                                </span>

                                                <span className="text-lg font-bold text-gray-900">
                                                    ₹
                                                    {Number(
                                                        selectedOrder.totalAmount ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>
                                            </div>

                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="rounded-xl border border-gray-200 p-4">
                                        <h3 className="font-bold text-gray-900">
                                            Payment Details
                                        </h3>

                                        <div className="mt-4 grid gap-4 sm:grid-cols-2">

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Payment Status
                                                </p>

                                                <span
                                                    className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentClass(
                                                        selectedOrder.paymentStatus
                                                    )}`}
                                                >
                                                    {
                                                        selectedOrder.paymentStatus
                                                    }
                                                </span>
                                            </div>

                                            {selectedOrder.razorpayPaymentId && (
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Razorpay Payment ID
                                                    </p>

                                                    <p className="mt-1 break-all text-xs font-medium text-gray-800">
                                                        {
                                                            selectedOrder.razorpayPaymentId
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {selectedOrder.razorpayRefundId && (
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Refund ID
                                                    </p>

                                                    <p className="mt-1 break-all text-xs font-medium text-gray-800">
                                                        {
                                                            selectedOrder.razorpayRefundId
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {selectedOrder.paidAt && (
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Paid At
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-gray-800">
                                                        {formatDateTime(
                                                            selectedOrder.paidAt
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {selectedOrder.refundedAt && (
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Refunded At
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-gray-800">
                                                        {formatDateTime(
                                                            selectedOrder.refundedAt
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                        </div>
                                    </div>

                                    {/* Current Status */}
                                    <div className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Current Order Status
                                                </p>

                                                <span
                                                    className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClass(
                                                        selectedOrder.orderStatus
                                                    )}`}
                                                >
                                                    {
                                                        selectedOrder.orderStatus
                                                    }
                                                </span>
                                            </div>

                                            <div className="w-full sm:w-56">
                                                <select
                                                    value={
                                                        selectedOrder.orderStatus
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        `status-${selectedOrder._id}`
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleStatusChange(
                                                            selectedOrder._id,
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold capitalize outline-none focus:border-gray-400"
                                                >
                                                    <option value="pending">
                                                        Pending
                                                    </option>

                                                    <option value="confirmed">
                                                        Confirmed
                                                    </option>

                                                    <option value="processing">
                                                        Processing
                                                    </option>

                                                    <option value="shipped">
                                                        Shipped
                                                    </option>

                                                    <option value="delivered">
                                                        Delivered
                                                    </option>

                                                    <option value="cancelled">
                                                        Cancelled
                                                    </option>
                                                </select>
                                            </div>

                                        </div>
                                    </div>

                                    {/* Cancellation / Refund info */}
                                    {(selectedOrder.cancelReason ||
                                        selectedOrder.refundReason) && (
                                        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">

                                            <p className="text-sm font-bold text-orange-800">
                                                Order Notes
                                            </p>

                                            {selectedOrder.cancelReason && (
                                                <p className="mt-2 text-sm text-orange-700">
                                                    Cancel Reason:{" "}
                                                    {
                                                        selectedOrder.cancelReason
                                                    }
                                                </p>
                                            )}

                                            {selectedOrder.refundReason && (
                                                <p className="mt-1 text-sm text-orange-700">
                                                    Refund Reason:{" "}
                                                    {
                                                        selectedOrder.refundReason
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}

                                </div>

                                {/* Modal Actions */}
                                <div className="sticky bottom-0 border-t border-gray-100 bg-white px-5 py-4 sm:px-6">

                                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">

                                        <button
                                            onClick={() =>
                                                setSelectedOrder(
                                                    null
                                                )
                                            }
                                            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400"
                                        >
                                            Close
                                        </button>

                                        {selectedOrder.orderStatus !==
                                            "delivered" &&
                                            selectedOrder.orderStatus !==
                                                "cancelled" && (
                                                <button
                                                    onClick={() =>
                                                        setShowCancelModal(
                                                            true
                                                        )
                                                    }
                                                    className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}

                                        {selectedOrder.paymentStatus ===
                                            "paid" &&
                                            !selectedOrder.razorpayRefundId && (
                                                <button
                                                    onClick={() =>
                                                        setShowRefundModal(
                                                            true
                                                        )
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                                                >
                                                    <RotateCcw className="h-4 w-4" />

                                                    Refund Payment
                                                </button>
                                            )}

                                    </div>
                                </div>

                            </div>
                        ) : null}

                    </div>
                </div>
            )}

            {/* ==========================================
                CANCEL MODAL
            ========================================== */}

            {showCancelModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">

                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900">
                                    Cancel Order
                                </h3>

                                <p className="text-xs text-gray-500">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Cancellation Reason
                            </label>

                            <textarea
                                value={cancelReason}
                                onChange={(e) =>
                                    setCancelReason(
                                        e.target.value
                                    )
                                }
                                rows={3}
                                className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-gray-400"
                            />
                        </div>

                        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                            <button
                                onClick={() =>
                                    setShowCancelModal(
                                        false
                                    )
                                }
                                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700"
                            >
                                Go Back
                            </button>

                            <button
                                onClick={
                                    handleCancelOrder
                                }
                                disabled={
                                    actionLoading ===
                                    `cancel-${selectedOrder?._id}`
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {actionLoading ===
                                `cancel-${selectedOrder?._id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : null}

                                Confirm Cancel
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* ==========================================
                REFUND MODAL
            ========================================== */}

            {showRefundModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">

                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                                <RotateCcw className="h-5 w-5 text-orange-600" />
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900">
                                    Refund Payment
                                </h3>

                                <p className="text-xs text-gray-500">
                                    Refund will be processed through
                                    Razorpay.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-xl bg-gray-50 p-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">
                                    Order
                                </span>

                                <span className="text-sm font-semibold text-gray-900">
                                    {
                                        selectedOrder?.orderNumber
                                    }
                                </span>
                            </div>

                            <div className="mt-2 flex justify-between">
                                <span className="text-sm text-gray-500">
                                    Refund Amount
                                </span>

                                <span className="text-base font-bold text-gray-900">
                                    ₹
                                    {Number(
                                        selectedOrder?.totalAmount ||
                                            0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Refund Reason
                            </label>

                            <textarea
                                value={refundReason}
                                onChange={(e) =>
                                    setRefundReason(
                                        e.target.value
                                    )
                                }
                                rows={3}
                                className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-gray-400"
                            />
                        </div>

                        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                            <button
                                onClick={() =>
                                    setShowRefundModal(
                                        false
                                    )
                                }
                                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700"
                            >
                                Go Back
                            </button>

                            <button
                                onClick={
                                    handleRefundOrder
                                }
                                disabled={
                                    actionLoading ===
                                    `refund-${selectedOrder?._id}`
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {actionLoading ===
                                `refund-${selectedOrder?._id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RotateCcw className="h-4 w-4" />
                                )}

                                Confirm Refund
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;