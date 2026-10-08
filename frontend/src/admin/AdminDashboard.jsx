import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    Users,
    Package,
    ShoppingBag,
    IndianRupee,
    RotateCcw,
    TrendingUp,
    Clock3,
    CheckCircle2,
    Truck,
    XCircle,
    AlertTriangle,
    PackageX,
    ArrowRight,
    Loader2,
    Star,
    Boxes,
    CreditCard,
    BarChart3,
    RefreshCw
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ============================================
    // FETCH DASHBOARD
    // ============================================

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/dashboard"
            );

            if (response.data.success) {
                setDashboard(
                    response.data.dashboard
                );
            }
        } catch (error) {
            console.error(
                "Admin Dashboard Error:",
                error.response?.data ||
                    error.message
            );

            setError(
                error.response?.data?.message ||
                    "Failed to load admin dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // AUTH CHECK
    // ============================================

    useEffect(() => {
        if (!user) return;

        if (user.role !== "admin") {
            navigate("/dashboard", {
                replace: true
            });

            return;
        }

        fetchDashboard();
    }, [user, navigate]);

    // ============================================
    // LOADING
    // ============================================

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
                <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="h-7 w-7 animate-spin" />

                    <span className="text-sm font-medium">
                        Loading admin dashboard...
                    </span>
                </div>
            </div>
        );
    }

    // ============================================
    // ERROR
    // ============================================

    if (error || !dashboard) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
                <div className="text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                        <XCircle className="h-7 w-7 text-red-500" />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-gray-900">
                        Dashboard unavailable
                    </h2>

                    <p className="mt-2 text-sm text-red-600">
                        {error ||
                            "Unable to load dashboard"}
                    </p>

                    <button
                        onClick={fetchDashboard}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>

                </div>
            </div>
        );
    }

    // ============================================
    // DASHBOARD DATA
    // ============================================

    const {
        overview = {},
        orders = {},
        payments = {},
        inventory = {},
        monthlySales = [],
        recentOrders = [],
        topProducts = []
    } = dashboard;

    // ============================================
    // OVERVIEW CARDS
    // ============================================

    const overviewCards = [
        {
            title: "Total Revenue",
            value: `₹${Number(
                overview.totalRevenue || 0
            ).toLocaleString("en-IN")}`,
            icon: IndianRupee,
            description: "All paid orders"
        },
        {
            title: "Net Revenue",
            value: `₹${Number(
                overview.netRevenue || 0
            ).toLocaleString("en-IN")}`,
            icon: TrendingUp,
            description: "After refunds"
        },
        {
            title: "Total Refunds",
            value: `₹${Number(
                overview.totalRefund || 0
            ).toLocaleString("en-IN")}`,
            icon: RotateCcw,
            description: "Refunded amount"
        },
        {
            title: "Average Order",
            value: `₹${Number(
                overview.averageOrderValue || 0
            ).toLocaleString("en-IN")}`,
            icon: BarChart3,
            description: "Average paid order"
        },
        {
            title: "Total Users",
            value: overview.totalUsers || 0,
            icon: Users,
            description: "Registered users"
        },
        {
            title: "Products",
            value: overview.totalProducts || 0,
            icon: Package,
            description: "Store products"
        },
        {
            title: "Orders",
            value: overview.totalOrders || 0,
            icon: ShoppingBag,
            description: "All orders"
        }
    ];

    // ============================================
    // ORDER CARDS
    // ============================================

    const orderCards = [
        {
            title: "Pending",
            value: orders.pending || 0,
            icon: Clock3
        },
        {
            title: "Confirmed",
            value: orders.confirmed || 0,
            icon: CheckCircle2
        },
        {
            title: "Processing",
            value: orders.processing || 0,
            icon: Package
        },
        {
            title: "Shipped",
            value: orders.shipped || 0,
            icon: Truck
        },
        {
            title: "Delivered",
            value: orders.delivered || 0,
            icon: CheckCircle2
        },
        {
            title: "Cancelled",
            value: orders.cancelled || 0,
            icon: XCircle
        }
    ];

    // ============================================
    // MONTHLY SALES
    // ============================================

    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    const monthlyChart = monthlySales.map(
        (item) => ({
            ...item,
            monthName:
                monthNames[
                    Number(item.month) - 1
                ] || "-"
        })
    );

    const maxRevenue = Math.max(
        ...monthlyChart.map(
            (item) =>
                Number(item.revenue || 0)
        ),
        1
    );

    const totalYearRevenue =
        monthlyChart.reduce(
            (total, item) =>
                total +
                Number(item.revenue || 0),
            0
        );

    const totalYearOrders =
        monthlyChart.reduce(
            (total, item) =>
                total +
                Number(item.orders || 0),
            0
        );

    // ============================================
    // STATUS COLORS
    // ============================================

    const getOrderStatusClass = (status) => {
        switch (status) {
            case "delivered":
                return "bg-green-50 text-green-700";

            case "cancelled":
                return "bg-red-50 text-red-700";

            case "shipped":
                return "bg-blue-50 text-blue-700";

            case "processing":
                return "bg-orange-50 text-orange-700";

            case "confirmed":
                return "bg-purple-50 text-purple-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getPaymentStatusClass = (status) => {
        switch (status) {
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

    // ============================================
    // UI
    // ============================================

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="mb-8">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <p className="text-sm font-medium text-gray-500">
                                Admin Panel
                            </p>

                            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                                Welcome, {user?.name}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Manage your store and monitor
                                your business performance.
                            </p>

                        </div>

                        <div className="flex flex-wrap gap-2">

                            {/* REFRESH */}

                            <button
                                onClick={fetchDashboard}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </button>

                            {/* VIEW STORE */}

                            <Link
                                to="/shop"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                View Store
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                        </div>

                    </div>

                </div>

                {/* ==================================
                    OVERVIEW
                ================================== */}

                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">

                    {overviewCards.map(
                        (card) => {

                            const Icon =
                                card.icon;

                            return (
                                <div
                                    key={
                                        card.title
                                    }
                                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                                >

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                        <Icon className="h-5 w-5 text-gray-700" />
                                    </div>

                                    <p className="mt-4 text-xs font-medium text-gray-500">
                                        {
                                            card.title
                                        }
                                    </p>

                                    <p className="mt-1 break-words text-lg font-bold text-gray-900 sm:text-xl">
                                        {
                                            card.value
                                        }
                                    </p>

                                    <p className="mt-1 text-[11px] text-gray-400">
                                        {
                                            card.description
                                        }
                                    </p>

                                </div>
                            );
                        }
                    )}

                </div>

                {/* ==================================
                    ORDER + INVENTORY
                ================================== */}

                <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_320px]">

                    {/* ORDER OVERVIEW */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-lg font-bold text-gray-900">
                                    Order Overview
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Current order status
                                </p>

                            </div>

                            <ShoppingBag className="h-5 w-5 text-gray-400" />

                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

                            {orderCards.map(
                                (card) => {

                                    const Icon =
                                        card.icon;

                                    return (
                                        <div
                                            key={
                                                card.title
                                            }
                                            className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                                        >

                                            <div className="flex items-center justify-between">

                                                <Icon className="h-5 w-5 text-gray-500" />

                                                <span className="text-xl font-bold text-gray-900">
                                                    {
                                                        card.value
                                                    }
                                                </span>

                                            </div>

                                            <p className="mt-3 text-sm font-medium text-gray-600">
                                                {
                                                    card.title
                                                }
                                            </p>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>

                    {/* INVENTORY */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                <Boxes className="h-5 w-5 text-gray-700" />
                            </div>

                            <div>

                                <h2 className="font-bold text-gray-900">
                                    Inventory
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Stock health
                                </p>

                            </div>

                        </div>

                        <div className="mt-6 space-y-3">

                            <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 p-4">

                                <div className="flex items-center gap-3">

                                    <AlertTriangle className="h-5 w-5 text-orange-600" />

                                    <span className="text-sm font-medium text-orange-800">
                                        Low Stock
                                    </span>

                                </div>

                                <span className="text-lg font-bold text-orange-700">
                                    {
                                        inventory.lowStock ||
                                        0
                                    }
                                </span>

                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">

                                <div className="flex items-center gap-3">

                                    <PackageX className="h-5 w-5 text-red-600" />

                                    <span className="text-sm font-medium text-red-800">
                                        Out of Stock
                                    </span>

                                </div>

                                <span className="text-lg font-bold text-red-700">
                                    {
                                        inventory.outOfStock ||
                                        0
                                    }
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ==================================
                    MONTHLY SALES
                ================================== */}

                <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <div className="flex items-center gap-2">

                                <TrendingUp className="h-5 w-5 text-gray-700" />

                                <h2 className="text-lg font-bold text-gray-900">
                                    Monthly Sales
                                </h2>

                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                Revenue and orders for{" "}
                                {new Date().getFullYear()}
                            </p>

                        </div>

                        <div className="flex gap-6">

                            <div>

                                <p className="text-xs text-gray-500">
                                    Revenue
                                </p>

                                <p className="font-bold text-gray-900">
                                    ₹
                                    {totalYearRevenue.toLocaleString(
                                        "en-IN"
                                    )}
                                </p>

                            </div>

                            <div>

                                <p className="text-xs text-gray-500">
                                    Orders
                                </p>

                                <p className="font-bold text-gray-900">
                                    {
                                        totalYearOrders
                                    }
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="mt-8 overflow-x-auto pb-2">

                        <div className="flex h-72 min-w-[700px] items-end gap-3 border-b border-gray-200 px-2">

                            {monthlyChart.map(
                                (item) => {

                                    const revenue =
                                        Number(
                                            item.revenue ||
                                                0
                                        );

                                    const height =
                                        revenue > 0
                                            ? Math.max(
                                                  (revenue /
                                                      maxRevenue) *
                                                      100,
                                                  5
                                              )
                                            : 2;

                                    return (
                                        <div
                                            key={
                                                item.month
                                            }
                                            className="flex h-full flex-1 flex-col justify-end"
                                        >

                                            <div className="group relative flex h-full items-end justify-center">

                                                <div
                                                    className="w-full max-w-12 rounded-t-lg bg-black transition-all duration-300 hover:bg-gray-700"
                                                    style={{
                                                        height: `${height}%`
                                                    }}
                                                >

                                                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">

                                                        ₹
                                                        {revenue.toLocaleString(
                                                            "en-IN"
                                                        )}

                                                        <br />

                                                        {
                                                            item.orders
                                                        }{" "}
                                                        orders

                                                    </div>

                                                </div>

                                            </div>

                                            <p className="mt-3 text-center text-xs font-medium text-gray-500">
                                                {
                                                    item.monthName
                                                }
                                            </p>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>

                </div>

                {/* ==================================
                    RECENT ORDERS
                ================================== */}

                <div className="mb-8 rounded-2xl border border-gray-200 bg-white shadow-sm">

                    {/* ==================================
                        RECENT ORDERS HEADER
                    ================================== */}

                    <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                        <div>

                            <h2 className="text-lg font-bold text-gray-900">
                                Recent Orders
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Latest customer orders
                            </p>

                        </div>

                        {/* ==============================
                            VIEW ALL BUTTON
                        ============================== */}

                        <Link
                            to="/admin/orders"
                            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                        >
                            View All Orders
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                    </div>

                    {/* ==================================
                        ORDERS DATA
                    ================================== */}

                    {recentOrders.length > 0 ? (
                        <>

                            {/* DESKTOP TABLE */}

                            <div className="hidden overflow-x-auto md:block">

                                <table className="w-full min-w-[750px]">

                                    <thead>

                                        <tr className="border-b border-gray-100 bg-gray-50 text-left">

                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Order
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Customer
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Amount
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Payment
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-gray-100">

                                        {recentOrders.map(
                                            (order) => (

                                                <tr
                                                    key={
                                                        order._id
                                                    }
                                                    className="transition hover:bg-gray-50"
                                                >

                                                    <td className="px-6 py-4">

                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {
                                                                order.orderNumber
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {new Date(
                                                                order.createdAt
                                                            ).toLocaleDateString(
                                                                "en-IN"
                                                            )}
                                                        </p>

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <p className="text-sm font-medium text-gray-900">
                                                            {
                                                                order
                                                                    .user
                                                                    ?.name ||
                                                                "Customer"
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {
                                                                order
                                                                    .user
                                                                    ?.email
                                                            }
                                                        </p>

                                                    </td>

                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">

                                                        ₹
                                                        {Number(
                                                            order.totalAmount ||
                                                                0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentStatusClass(
                                                                order.paymentStatus
                                                            )}`}
                                                        >
                                                            {
                                                                order.paymentStatus
                                                            }
                                                        </span>

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getOrderStatusClass(
                                                                order.orderStatus
                                                            )}`}
                                                        >
                                                            {
                                                                order.orderStatus
                                                            }
                                                        </span>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            {/* MOBILE */}

                            <div className="divide-y divide-gray-100 md:hidden">

                                {recentOrders.map(
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
                                                        {new Date(
                                                            order.createdAt
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )}
                                                    </p>

                                                </div>

                                                <p className="shrink-0 font-bold text-gray-900">
                                                    ₹
                                                    {Number(
                                                        order.totalAmount ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>

                                            </div>

                                            <p className="mt-3 text-sm font-semibold text-gray-800">
                                                {
                                                    order
                                                        .user
                                                        ?.name ||
                                                    "Customer"
                                                }
                                            </p>

                                            <p className="mt-1 truncate text-xs text-gray-500">
                                                {
                                                    order
                                                        .user
                                                        ?.email
                                                }
                                            </p>

                                            <div className="mt-4 flex flex-wrap gap-2">

                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentStatusClass(
                                                        order.paymentStatus
                                                    )}`}
                                                >
                                                    {
                                                        order.paymentStatus
                                                    }
                                                </span>

                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getOrderStatusClass(
                                                        order.orderStatus
                                                    )}`}
                                                >
                                                    {
                                                        order.orderStatus
                                                    }
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </>
                    ) : (

                        <div className="p-12 text-center">

                            <ShoppingBag className="mx-auto h-10 w-10 text-gray-300" />

                            <p className="mt-3 text-sm text-gray-500">
                                No recent orders found.
                            </p>

                            {/* VIEW ALL EVEN IF EMPTY */}

                            <Link
                                to="/admin/orders"
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
                            >
                                View All Orders
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                        </div>

                    )}

                </div>

                {/* ==================================
                    PAYMENTS
                ================================== */}

                <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                            <CreditCard className="h-5 w-5 text-gray-700" />
                        </div>

                        <div>

                            <h2 className="font-bold text-gray-900">
                                Payments
                            </h2>

                            <p className="text-sm text-gray-500">
                                Payment overview
                            </p>

                        </div>

                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">

                        <div className="flex items-center justify-between rounded-xl bg-green-50 p-5">

                            <span className="text-sm font-medium text-green-800">
                                Paid Orders
                            </span>

                            <span className="text-2xl font-bold text-green-700">
                                {
                                    payments.paid ||
                                    0
                                }
                            </span>

                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-orange-50 p-5">

                            <span className="text-sm font-medium text-orange-800">
                                Refunded Orders
                            </span>

                            <span className="text-2xl font-bold text-orange-700">
                                {
                                    payments.refunded ||
                                    0
                                }
                            </span>

                        </div>

                    </div>

                </div>

                {/* ==================================
                    TOP PRODUCTS
                ================================== */}

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:p-6">

                        <div>

                            <h2 className="text-lg font-bold text-gray-900">
                                Top Products
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Best selling products
                            </p>

                        </div>

                        <Package className="h-5 w-5 text-gray-400" />

                    </div>

                    {topProducts.length > 0 ? (

                        <div className="grid divide-y divide-gray-100 md:grid-cols-2 md:divide-x md:divide-y-0">

                            {topProducts.map(
                                (product) => {

                                    const price =
                                        product.discountPrice ??
                                        product.price ??
                                        0;

                                    return (
                                        <div
                                            key={
                                                product._id
                                            }
                                            className="flex gap-4 p-5 transition hover:bg-gray-50 sm:p-6"
                                        >

                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-24 sm:w-24">

                                                {product.images?.[0] ? (

                                                    <img
                                                        src={
                                                            product
                                                                .images[0]
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />

                                                ) : (

                                                    <div className="flex h-full items-center justify-center">

                                                        <Package className="h-7 w-7 text-gray-400" />

                                                    </div>

                                                )}

                                            </div>

                                            <div className="min-w-0 flex-1">

                                                <h3 className="truncate font-semibold text-gray-900">
                                                    {
                                                        product.name
                                                    }
                                                </h3>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {product.category?.name ||
                                                        "Uncategorized"}
                                                </p>

                                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">

                                                    <span className="font-bold text-gray-900">
                                                        ₹
                                                        {Number(
                                                            price
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </span>

                                                    <span className="text-gray-500">
                                                        Stock:{" "}
                                                        {
                                                            product.stock
                                                        }
                                                    </span>

                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">

                                                    <span className="font-medium text-gray-600">
                                                        Sold:{" "}
                                                        {
                                                            product.soldCount
                                                        }
                                                    </span>

                                                    {product.rating >
                                                        0 && (

                                                        <span className="flex items-center gap-1 text-gray-500">

                                                            <Star className="h-3.5 w-3.5 fill-current" />

                                                            {
                                                                product.rating
                                                            }

                                                        </span>

                                                    )}

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    ) : (

                        <div className="p-12 text-center">

                            <Package className="mx-auto h-10 w-10 text-gray-300" />

                            <p className="mt-3 text-sm text-gray-500">
                                No top products found.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};

export default AdminDashboard;