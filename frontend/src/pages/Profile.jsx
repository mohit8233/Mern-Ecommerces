import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    ShieldCheck,
    CalendarDays,
    Edit3,
    Lock,
    Moon,
    Sun,
    Package,
    Heart,
    MapPin,
    LogOut,
    ChevronRight,
    Check,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();

        // Backend update-profile API can be connected here
        alert("Profile update API will be connected next.");
        setShowEdit(false);
    };

    const handleChangePassword = (e) => {
        e.preventDefault();

        // Backend change-password API can be connected here
        alert("Change password API will be connected next.");
        setShowPassword(false);
    };

    const formatDate = (date) => {
        if (!date) return "Recently";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    if (!user) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="text-center">
                    <User className="mx-auto mb-4 h-14 w-14 text-gray-300" />

                    <h2 className="text-2xl font-bold text-gray-900">
                        Please Login
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Login to access your profile.
                    </p>

                    <Link
                        to="/login"
                        className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen px-4 py-8 sm:px-6 lg:px-8 ${
                darkMode ? "bg-gray-950" : "bg-gray-50"
            }`}
        >
            <div className="mx-auto max-w-6xl">

                {/* HEADER */}
                <div className="mb-8">
                    <p
                        className={`text-sm font-medium ${
                            darkMode
                                ? "text-gray-400"
                                : "text-gray-500"
                        }`}
                    >
                        Account
                    </p>

                    <h1
                        className={`mt-1 text-3xl font-bold sm:text-4xl ${
                            darkMode
                                ? "text-white"
                                : "text-gray-900"
                        }`}
                    >
                        My Profile
                    </h1>

                    <p
                        className={`mt-2 ${
                            darkMode
                                ? "text-gray-400"
                                : "text-gray-500"
                        }`}
                    >
                        Manage your account, security and preferences.
                    </p>
                </div>

                {/* PROFILE CARD */}
                <div
                    className={`overflow-hidden rounded-2xl border shadow-sm ${
                        darkMode
                            ? "border-gray-800 bg-gray-900"
                            : "border-gray-200 bg-white"
                    }`}
                >
                    <div
                        className={`h-32 ${
                            darkMode
                                ? "bg-gray-800"
                                : "bg-gray-100"
                        }`}
                    />

                    <div className="px-5 pb-6 sm:px-8">
                        <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                                {/* AVATAR */}
                                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-black text-3xl font-bold text-white shadow-lg">
                                    {user.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "U"}
                                </div>

                                <div className="pb-1">
                                    <h2
                                        className={`text-2xl font-bold ${
                                            darkMode
                                                ? "text-white"
                                                : "text-gray-900"
                                        }`}
                                    >
                                        {user.name}
                                    </h2>

                                    <p
                                        className={`mt-1 text-sm ${
                                            darkMode
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowEdit(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                <Edit3 className="h-4 w-4" />
                                Edit Profile
                            </button>
                        </div>

                        {/* USER INFO */}
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                            <div
                                className={`rounded-xl border p-4 ${
                                    darkMode
                                        ? "border-gray-800 bg-gray-950"
                                        : "border-gray-200 bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <User className="h-5 w-5 text-gray-700" />
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Full Name
                                        </p>

                                        <p
                                            className={`mt-1 font-semibold ${
                                                darkMode
                                                    ? "text-white"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            {user.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`rounded-xl border p-4 ${
                                    darkMode
                                        ? "border-gray-800 bg-gray-950"
                                        : "border-gray-200 bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <Mail className="h-5 w-5 text-gray-700" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500">
                                            Email Address
                                        </p>

                                        <p
                                            className={`mt-1 truncate font-semibold ${
                                                darkMode
                                                    ? "text-white"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`rounded-xl border p-4 ${
                                    darkMode
                                        ? "border-gray-800 bg-gray-950"
                                        : "border-gray-200 bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <ShieldCheck className="h-5 w-5 text-gray-700" />
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Account Type
                                        </p>

                                        <p
                                            className={`mt-1 font-semibold capitalize ${
                                                darkMode
                                                    ? "text-white"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            {user.role || "User"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`rounded-xl border p-4 ${
                                    darkMode
                                        ? "border-gray-800 bg-gray-950"
                                        : "border-gray-200 bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <CalendarDays className="h-5 w-5 text-gray-700" />
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Member Since
                                        </p>

                                        <p
                                            className={`mt-1 font-semibold ${
                                                darkMode
                                                    ? "text-white"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            {formatDate(user.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SETTINGS */}
                <div className="mt-8 grid gap-6 lg:grid-cols-2">

                    {/* ACCOUNT SETTINGS */}
                    <div
                        className={`rounded-2xl border shadow-sm ${
                            darkMode
                                ? "border-gray-800 bg-gray-900"
                                : "border-gray-200 bg-white"
                        }`}
                    >
                        <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
                            <h2
                                className={`text-lg font-bold ${
                                    darkMode
                                        ? "text-white"
                                        : "text-gray-900"
                                }`}
                            >
                                Account Settings
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage your account preferences.
                            </p>
                        </div>

                        <div className="divide-y divide-gray-200">

                            {/* EDIT */}
                            <button
                                onClick={() => setShowEdit(true)}
                                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-gray-50 sm:px-6"
                            >
                                <div className="rounded-xl bg-gray-100 p-3">
                                    <Edit3 className="h-5 w-5 text-gray-700" />
                                </div>

                                <div className="flex-1">
                                    <p
                                        className={`font-semibold ${
                                            darkMode
                                                ? "text-white"
                                                : "text-gray-900"
                                        }`}
                                    >
                                        Edit Profile
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Update your name and email.
                                    </p>
                                </div>

                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </button>

                            {/* PASSWORD */}
                            <button
                                onClick={() => setShowPassword(true)}
                                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-gray-50 sm:px-6"
                            >
                                <div className="rounded-xl bg-gray-100 p-3">
                                    <Lock className="h-5 w-5 text-gray-700" />
                                </div>

                                <div className="flex-1">
                                    <p
                                        className={`font-semibold ${
                                            darkMode
                                                ? "text-white"
                                                : "text-gray-900"
                                        }`}
                                    >
                                        Change Password
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Keep your account secure.
                                    </p>
                                </div>

                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </button>

                            {/* THEME */}
                            <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
                                <div className="rounded-xl bg-gray-100 p-3">
                                    {darkMode ? (
                                        <Moon className="h-5 w-5 text-gray-700" />
                                    ) : (
                                        <Sun className="h-5 w-5 text-gray-700" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p
                                        className={`font-semibold ${
                                            darkMode
                                                ? "text-white"
                                                : "text-gray-900"
                                        }`}
                                    >
                                        Dark Mode
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Change your display preference.
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        setDarkMode(!darkMode)
                                    }
                                    className={`relative h-7 w-12 rounded-full transition ${
                                        darkMode
                                            ? "bg-black"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                                            darkMode
                                                ? "left-6"
                                                : "left-1"
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* QUICK LINKS */}
                    <div
                        className={`rounded-2xl border shadow-sm ${
                            darkMode
                                ? "border-gray-800 bg-gray-900"
                                : "border-gray-200 bg-white"
                        }`}
                    >
                        <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
                            <h2
                                className={`text-lg font-bold ${
                                    darkMode
                                        ? "text-white"
                                        : "text-gray-900"
                                }`}
                            >
                                Quick Access
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Quickly access your shopping activity.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">

                            <Link
                                to="/orders"
                                className="group flex items-center gap-4 p-5 transition hover:bg-gray-50"
                            >
                                <div className="rounded-xl bg-gray-100 p-3">
                                    <Package className="h-5 w-5 text-gray-700" />
                                </div>

                                <div className="flex-1">
                                    <p
                                        className={`font-semibold ${
                                            darkMode
                                                ? "text-white"
                                                : "text-gray-900"
                                        }`}
                                    >
                                        My Orders
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        View your orders
                                    </p>
                                </div>

                                <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
                            </Link>

                            <Link
                                to="/wishlist"
                                className="group flex items-center gap-4 p-5 transition hover:bg-gray-50"
                            >
                                <div className="rounded-xl bg-gray-100 p-3">
                                    <Heart className="h-5 w-5 text-gray-700" />
                                </div>

                                <div className="flex-1">
                                    <p
                                        className={`font-semibold ${
                                            darkMode
                                                ? "text-white"
                                                : "text-gray-900"
                                        }`}
                                    >
                                        Wishlist
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Saved products
                                    </p>
                                </div>

                                <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
                            </Link>

                            <Link
                                to="/addresses"
                                className="group flex items-center gap-4 p-5 transition hover:bg-gray-50"
                            >
                                <div className="rounded-xl bg-gray-100 p-3">
                                    <MapPin className="h-5 w-5 text-gray-700" />
                                </div>

                                <div className="flex-1">
                                    <p
                                        className={`font-semibold ${
                                            darkMode
                                                ? "text-white"
                                                : "text-gray-900"
                                        }`}
                                    >
                                        Addresses
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Manage delivery addresses
                                    </p>
                                </div>

                                <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="group flex items-center gap-4 p-5 text-left transition hover:bg-red-50"
                            >
                                <div className="rounded-xl bg-red-100 p-3">
                                    <LogOut className="h-5 w-5 text-red-600" />
                                </div>

                                <div className="flex-1">
                                    <p className="font-semibold text-red-600">
                                        Sign Out
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Logout from your account
                                    </p>
                                </div>

                                <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            {showEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Edit Profile
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Update your account information.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSaveProfile}
                            className="space-y-4"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowEdit(false)
                                    }
                                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PASSWORD MODAL */}
            {showPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Change Password
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Create a new secure password.
                            </p>
                        </div>

                        <form
                            onSubmit={handleChangePassword}
                            className="space-y-4"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Current Password
                                </label>

                                <input
                                    type="password"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(false)
                                    }
                                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;