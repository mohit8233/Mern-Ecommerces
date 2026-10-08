import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Menu,
    X,
    Search,
    Heart,
    ShoppingCart,
    User,
    LogOut,
    LayoutDashboard
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();

    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState("");

    const isAdmin = user?.role === "admin";

    const dashboardPath = isAdmin
        ? "/admin/dashboard"
        : "/dashboard";

    const handleSearch = (e) => {
        e.preventDefault();

        const value = search.trim();

        if (!value) {
            navigate("/shop");
            return;
        }

        navigate(
            `/shop?search=${encodeURIComponent(value)}`
        );

        setSearch("");
        setMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
        setMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="flex h-16 items-center justify-between gap-4">

                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex shrink-0 items-center gap-2"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-lg font-bold text-white">
                            C
                        </div>

                        <span className="text-xl font-bold tracking-tight text-gray-900">
                            Cartify
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-7 lg:flex">

                        <Link
                            to="/"
                            className="text-sm font-medium text-gray-700 transition hover:text-black"
                        >
                            Home
                        </Link>

                        <Link
                            to="/shop"
                            className="text-sm font-medium text-gray-700 transition hover:text-black"
                        >
                            Shop
                        </Link>

                        {/* Dashboard
                        {user && (
                            <Link
                                to={dashboardPath}
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 transition hover:text-black"
                            >
                                <LayoutDashboard className="h-4 w-4" />

                                {isAdmin
                                    ? "Admin"
                                    : "Dashboard"}
                            </Link>
                        )} */}

                    </nav>

                    {/* Desktop Search */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden flex-1 md:flex md:max-w-md"
                    >
                        <div className="relative w-full">

                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search products..."
                                className="h-10 w-full rounded-full border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-gray-500 focus:bg-white"
                            />

                        </div>
                    </form>

                    {/* Right Actions */}
                    <div className="hidden items-center gap-2 sm:flex">

                        {/* Wishlist */}
                        <button
                            onClick={() =>
                                navigate("/wishlist")
                            }
                            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-black"
                            aria-label="Wishlist"
                        >
                            <Heart size={20} />

                            {wishlistCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                                    {wishlistCount > 99
                                        ? "99+"
                                        : wishlistCount}
                                </span>
                            )}
                        </button>

                        {/* Cart */}
                        <button
                            onClick={() =>
                                navigate("/cart")
                            }
                            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-black"
                            aria-label="Cart"
                        >
                            <ShoppingCart size={20} />

                            {cartCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                                    {cartCount > 99
                                        ? "99+"
                                        : cartCount}
                                </span>
                            )}
                        </button>

                        {/* User */}
                        {user ? (
                            <div className="ml-2 flex items-center gap-2">

                                {/* Dashboard */}
                                <button
                                    onClick={() =>
                                        navigate(
                                            dashboardPath
                                        )
                                    }
                                    className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black"
                                    title={
                                        isAdmin
                                            ? "Admin Dashboard"
                                            : "Dashboard"
                                    }
                                >
                                    <LayoutDashboard size={18} />

                                    <span className="hidden xl:block">
                                        {isAdmin
                                            ? "Admin"
                                            : "Dashboard"}
                                    </span>
                                </button>

                                {/* Profile */}
                                <button
                                    onClick={() =>
                                        navigate(
                                            "/profile"
                                        )
                                    }
                                    className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                                >
                                    <User size={18} />

                                    <span className="max-w-24 truncate">
                                        {user.name}
                                    </span>
                                </button>

                                {/* Logout */}
                                <button
                                    onClick={
                                        handleLogout
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                                    aria-label="Logout"
                                >
                                    <LogOut size={18} />
                                </button>

                            </div>
                        ) : (
                            <button
                                onClick={() =>
                                    navigate("/login")
                                }
                                className="ml-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Login
                            </button>
                        )}

                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center gap-1 sm:hidden">

                        {/* Mobile Cart */}
                        <button
                            onClick={() =>
                                navigate("/cart")
                            }
                            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700"
                            aria-label="Cart"
                        >
                            <ShoppingCart size={20} />

                            {cartCount > 0 && (
                                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                                    {cartCount > 99
                                        ? "99+"
                                        : cartCount}
                                </span>
                            )}
                        </button>

                        {/* Menu */}
                        <button
                            onClick={() =>
                                setMenuOpen(!menuOpen)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700"
                            aria-label="Menu"
                        >
                            {menuOpen ? (
                                <X size={22} />
                            ) : (
                                <Menu size={22} />
                            )}
                        </button>

                    </div>

                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="border-t border-gray-100 py-4 sm:hidden">

                        {/* Mobile Search */}
                        <form
                            onSubmit={handleSearch}
                            className="mb-4"
                        >
                            <div className="relative">

                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search products..."
                                    className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-gray-500"
                                />

                            </div>
                        </form>

                        {/* Links */}
                        <div className="space-y-1">

                            {/* Home */}
                            <Link
                                to="/"
                                onClick={() =>
                                    setMenuOpen(false)
                                }
                                className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Home
                            </Link>

                            {/* Shop */}
                            <Link
                                to="/shop"
                                onClick={() =>
                                    setMenuOpen(false)
                                }
                                className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Shop
                            </Link>

                            {/* Dashboard */}
                            {user && (
                                <Link
                                    to={dashboardPath}
                                    onClick={() =>
                                        setMenuOpen(false)
                                    }
                                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    <LayoutDashboard size={18} />

                                    {isAdmin
                                        ? "Admin Dashboard"
                                        : "Dashboard"}
                                </Link>
                            )}

                            {/* Wishlist */}
                            <Link
                                to="/wishlist"
                                onClick={() =>
                                    setMenuOpen(false)
                                }
                                className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                <span className="flex items-center gap-3">
                                    <Heart size={18} />
                                    Wishlist
                                </span>

                                {wishlistCount > 0 && (
                                    <span className="rounded-full bg-black px-2 py-0.5 text-xs font-semibold text-white">
                                        {wishlistCount > 99
                                            ? "99+"
                                            : wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Cart */}
                            <Link
                                to="/cart"
                                onClick={() =>
                                    setMenuOpen(false)
                                }
                                className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                <span className="flex items-center gap-3">
                                    <ShoppingCart size={18} />
                                    Cart
                                </span>

                                {cartCount > 0 && (
                                    <span className="rounded-full bg-black px-2 py-0.5 text-xs font-semibold text-white">
                                        {cartCount > 99
                                            ? "99+"
                                            : cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* User */}
                            {user ? (
                                <>
                                    {/* Profile */}
                                    <Link
                                        to="/profile"
                                        onClick={() =>
                                            setMenuOpen(
                                                false
                                            )
                                        }
                                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                    >
                                        <User size={18} />
                                        {user.name}
                                    </Link>

                                    {/* Logout */}
                                    <button
                                        onClick={
                                            handleLogout
                                        }
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        navigate(
                                            "/login"
                                        );
                                        setMenuOpen(
                                            false
                                        );
                                    }}
                                    className="mt-2 flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white"
                                >
                                    Login
                                </button>
                            )}

                        </div>
                    </div>
                )}

            </div>
        </header>
    );
};

export default Navbar;