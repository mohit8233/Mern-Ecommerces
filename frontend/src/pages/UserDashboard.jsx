import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ShoppingBag,
    Clock3,
    CheckCircle2,
    XCircle,
    Wallet,
    Heart,
    ShoppingCart,
    ArrowRight,
    Package,
    Loader2,
    User,
    Mail
} from "lucide-react";

import api from "../services/api";

const UserDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/user/dashboard"
            );

            if (response.data.success) {
                setDashboard(
                    response.data.dashboard
                );
            }
        } catch (error) {
            console.error(
                "User dashboard error:",
                error.response?.data ||
                    error.message
            );

            setError(
                error.response?.data?.message ||
                    "Unable to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // LOADING
    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
            </div>
        );
    }

    // ERROR
    if (error || !dashboard) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-red-600">
                        {error ||
                            "Unable to load dashboard"}
                    </p>

                    <button
                        onClick={fetchDashboard}
                        className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const {
        user,
        statistics,
        recentOrders,
        wishlist
    } = dashboard;

    const stats = [
        {
            title: "Total Orders",
            value: statistics.totalOrders,
            icon: ShoppingBag,
            link: "/orders"
        },
        {
            title: "Pending Orders",
            value: statistics.pendingOrders,
            icon: Clock3,
            link: "/orders"
        },
        {
            title: "Delivered",
            value: statistics.deliveredOrders,
            icon: CheckCircle2,
            link: "/orders"
        },
        {
            title: "Cancelled",
            value: statistics.cancelledOrders,
            icon: XCircle,
            link: "/orders"
        },
        {
            title: "Total Spent",
            value: `₹${statistics.totalSpent.toLocaleString(
                "en-IN"
            )}`,
            icon: Wallet,
            link: "/orders"
        },
        {
            title: "Wishlist",
            value: statistics.wishlistItems,
            icon: Heart,
            link: "/wishlist"
        }
    ];

    const getStatusClass = (status) => {
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

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* HEADER */}
                <div className="mb-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                My Account
                            </p>

                            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                                Welcome, {user?.name}
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage your orders, wishlist and account.
                            </p>
                        </div>

                        <Link
                            to="/orders"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            My Orders
                        </Link>
                    </div>
                </div>

                {/* PROFILE + QUICK ACTIONS */}
                <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_360px]">

                    {/* PROFILE */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                                <User className="h-7 w-7" />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {user?.name}
                                </h2>

                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                    <Mail className="h-4 w-4" />
                                    {user?.email}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Account Type
                                </p>

                                <p className="mt-1 text-sm font-semibold capitalize text-gray-800">
                                    {user?.role || "user"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Member Since
                                </p>

                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                    {user?.createdAt
                                        ? new Date(
                                              user.createdAt
                                          ).toLocaleDateString(
                                              "en-IN",
                                              {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric"
                                              }
                                          )
                                        : "-"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900">
                            Quick Actions
                        </h2>

                        <div className="mt-4 grid grid-cols-2 gap-3">

                            <Link
                                to="/orders"
                                className="group rounded-xl border border-gray-200 p-4 transition hover:border-black"
                            >
                                <ShoppingBag className="h-5 w-5 text-gray-700" />

                                <p className="mt-2 text-sm font-semibold">
                                    Orders
                                </p>
                            </Link>

                            <Link
                                to="/wishlist"
                                className="group rounded-xl border border-gray-200 p-4 transition hover:border-black"
                            >
                                <Heart className="h-5 w-5 text-gray-700" />

                                <p className="mt-2 text-sm font-semibold">
                                    Wishlist
                                </p>
                            </Link>

                            <Link
                                to="/cart"
                                className="group rounded-xl border border-gray-200 p-4 transition hover:border-black"
                            >
                                <ShoppingCart className="h-5 w-5 text-gray-700" />

                                <p className="mt-2 text-sm font-semibold">
                                    Cart
                                </p>
                            </Link>

                            <Link
                                to="/addresses"
                                className="group rounded-xl border border-gray-200 p-4 transition hover:border-black"
                            >
                                <Package className="h-5 w-5 text-gray-700" />

                                <p className="mt-2 text-sm font-semibold">
                                    Addresses
                                </p>
                            </Link>

                        </div>
                    </div>
                </div>

                {/* STATISTICS */}
                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                    {stats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <Link
                                key={stat.title}
                                to={stat.link}
                                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                        <Icon className="h-5 w-5 text-gray-700" />
                                    </div>

                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                </div>

                                <p className="mt-4 text-xs font-medium text-gray-500">
                                    {stat.title}
                                </p>

                                <p className="mt-1 text-xl font-bold text-gray-900">
                                    {stat.value}
                                </p>
                            </Link>
                        );
                    })}
                </div>

                {/* MAIN GRID */}
                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

                    {/* RECENT ORDERS */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

                        <div className="flex items-center justify-between border-b border-gray-100 p-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Recent Orders
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Your latest orders
                                </p>
                            </div>

                            <Link
                                to="/orders"
                                className="text-sm font-semibold text-gray-700 hover:text-black"
                            >
                                View All
                            </Link>
                        </div>

                        {recentOrders?.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {recentOrders.map(
                                    (order) => (
                                        <Link
                                            key={order._id}
                                            to={`/orders/${order._id}`}
                                            className="flex flex-col gap-3 p-6 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {
                                                        order.orderNumber
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
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

                                            <div className="flex items-center justify-between gap-4 sm:justify-end">

                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">
                                                        ₹
                                                        {order.totalAmount.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs capitalize text-gray-500">
                                                        {
                                                            order.paymentStatus
                                                        }
                                                    </p>
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClass(
                                                        order.orderStatus
                                                    )}`}
                                                >
                                                    {
                                                        order.orderStatus
                                                    }
                                                </span>

                                                <ArrowRight className="hidden h-4 w-4 text-gray-400 sm:block" />
                                            </div>
                                        </Link>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="p-10 text-center">
                                <Package className="mx-auto h-10 w-10 text-gray-300" />

                                <p className="mt-3 text-sm text-gray-500">
                                    You don't have any orders yet.
                                </p>

                                <Link
                                    to="/shop"
                                    className="mt-4 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* WISHLIST */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

                        <div className="flex items-center justify-between border-b border-gray-100 p-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Wishlist
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Saved products
                                </p>
                            </div>

                            <Link
                                to="/wishlist"
                                className="text-sm font-semibold text-gray-700 hover:text-black"
                            >
                                View All
                            </Link>
                        </div>

                        {wishlist?.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {wishlist
                                    .slice(0, 4)
                                    .map((product) => {
                                        const price =
                                            product.discountPrice ??
                                            product.price;

                                        return (
                                            <Link
                                                key={product._id}
                                                to={`/products/${product._id}`}
                                                className="flex gap-3 p-4 transition hover:bg-gray-50"
                                            >
                                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
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
                                                            <Package className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {
                                                            product.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm font-bold text-gray-900">
                                                        ₹
                                                        {price.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </p>

                                                    {product.rating >
                                                        0 && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            ★{" "}
                                                            {
                                                                product.rating
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                            </div>
                        ) : (
                            <div className="p-10 text-center">
                                <Heart className="mx-auto h-10 w-10 text-gray-300" />

                                <p className="mt-3 text-sm text-gray-500">
                                    Your wishlist is empty.
                                </p>

                                <Link
                                    to="/shop"
                                    className="mt-4 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
                                >
                                    Explore Products
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTTOM QUICK STATS */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <Link
                        to="/cart"
                        className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                                <ShoppingCart className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Cart Items
                                </p>

                                <p className="text-xl font-bold">
                                    {statistics.cartItems}
                                </p>
                            </div>
                        </div>

                        <ArrowRight className="h-5 w-5 text-gray-400" />
                    </Link>

                    <Link
                        to="/wishlist"
                        className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                                <Heart className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Wishlist Items
                                </p>

                                <p className="text-xl font-bold">
                                    {statistics.wishlistItems}
                                </p>
                            </div>
                        </div>

                        <ArrowRight className="h-5 w-5 text-gray-400" />
                    </Link>

                </div>
            </div>
        </div>
    );
};

export default UserDashboard;