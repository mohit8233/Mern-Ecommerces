import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
    Loader2
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    const fetchCart = async () => {
        try {
            setLoading(true);

            const response = await api.get("/cart");

            setCart(response.data?.cart || null);
        } catch (error) {
            console.error(
                "Cart error:",
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        fetchCart();
    }, [user]);

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;

        try {
            setUpdating(productId);

            const response = await api.put(
                `/cart/${productId}`,
                { quantity }
            );

            setCart(response.data?.cart || null);
        } catch (error) {
            console.error(
                "Update cart error:",
                error.response?.data || error.message
            );
        } finally {
            setUpdating(null);
        }
    };

    const removeItem = async (productId) => {
        try {
            setUpdating(productId);

            const response = await api.delete(
                `/cart/${productId}`
            );

            setCart(response.data?.cart || null);
        } catch (error) {
            console.error(
                "Remove cart error:",
                error.response?.data || error.message
            );
        } finally {
            setUpdating(null);
        }
    };

    if (!user) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag size={32} />
                    </div>

                    <h1 className="text-3xl font-bold mt-6">
                        Your Cart
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Please login to view your cart.
                    </p>

                    <Link
                        to="/login"
                        className="inline-block mt-6 bg-black text-white px-7 py-3 rounded-xl font-semibold"
                    >
                        Login
                    </Link>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center">
                <Loader2
                    size={36}
                    className="animate-spin"
                />
            </main>
        );
    }

    const items = cart?.items || [];

    const subtotal =
        cart?.totalPrice ??
        items.reduce((total, item) => {
            const product = item.product;

            if (!product) return total;

            const price =
                product.discountPrice ??
                product.price ??
                0;

            return total + price * item.quantity;
        }, 0);

    const shipping = subtotal > 0 ? 0 : 0;
    const total = subtotal + shipping;

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <section className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
                    >
                        <ArrowLeft size={17} />
                        Continue Shopping
                    </Link>

                    <h1 className="text-4xl font-bold mt-5">
                        Shopping Cart
                    </h1>

                    <p className="text-gray-500 mt-2">
                        {items.length}{" "}
                        {items.length === 1
                            ? "item"
                            : "items"}{" "}
                        in your cart
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 py-24 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <ShoppingBag size={32} />
                        </div>

                        <h2 className="text-2xl font-bold mt-6">
                            Your cart is empty
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Looks like you haven't added
                            anything yet.
                        </p>

                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 mt-6 bg-black text-white px-7 py-3 rounded-xl font-semibold"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => {
                                const product = item.product;

                                if (!product) return null;

                                const price =
                                    product.discountPrice ??
                                    product.price ??
                                    0;

                                return (
                                    <div
                                        key={
                                            product._id
                                        }
                                        className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5"
                                    >
                                        <div className="flex gap-4">
                                            {/* Image */}
                                            <Link
                                                to={`/product/${product._id}`}
                                                className="w-28 h-28 sm:w-36 sm:h-36 bg-gray-100 rounded-xl overflow-hidden shrink-0"
                                            >
                                                <img
                                                    src={
                                                        product
                                                            .images?.[0] ||
                                                        "https://via.placeholder.com/300x300?text=No+Image"
                                                    }
                                                    alt={
                                                        product.name
                                                    }
                                                    className="w-full h-full object-cover"
                                                />
                                            </Link>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase">
                                                            {product.brand ||
                                                                "Shopora"}
                                                        </p>

                                                        <Link
                                                            to={`/product/${product._id}`}
                                                        >
                                                            <h2 className="font-semibold text-lg mt-1 hover:text-gray-500">
                                                                {
                                                                    product.name
                                                                }
                                                            </h2>
                                                        </Link>
                                                    </div>

                                                    <button
                                                        onClick={() =>
                                                            removeItem(
                                                                product._id
                                                            )
                                                        }
                                                        disabled={
                                                            updating ===
                                                            product._id
                                                        }
                                                        className="text-gray-400 hover:text-red-600 transition"
                                                        title="Remove"
                                                    >
                                                        <Trash2
                                                            size={
                                                                19
                                                            }
                                                        />
                                                    </button>
                                                </div>

                                                <p className="font-bold text-lg mt-4">
                                                    ₹
                                                    {Number(
                                                        price
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    product._id,
                                                                    item.quantity -
                                                                        1
                                                                )
                                                            }
                                                            disabled={
                                                                item.quantity <=
                                                                    1 ||
                                                                updating ===
                                                                    product._id
                                                            }
                                                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                                                        >
                                                            <Minus
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </button>

                                                        <span className="w-10 text-center text-sm font-semibold">
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    product._id,
                                                                    item.quantity +
                                                                        1
                                                                )
                                                            }
                                                            disabled={
                                                                updating ===
                                                                product._id ||
                                                                item.quantity >=
                                                                    product.stock
                                                            }
                                                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                                                        >
                                                            <Plus
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </button>
                                                    </div>

                                                    <p className="font-bold">
                                                        ₹
                                                        {Number(
                                                            price *
                                                                item.quantity
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <aside>
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-28">
                                <h2 className="text-xl font-bold">
                                    Order Summary
                                </h2>

                                <div className="space-y-4 mt-6 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Subtotal
                                        </span>

                                        <span className="font-semibold">
                                            ₹
                                            {Number(
                                                subtotal
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Shipping
                                        </span>

                                        <span className="font-semibold text-green-600">
                                            FREE
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 my-5" />

                                <div className="flex justify-between">
                                    <span className="font-bold">
                                        Total
                                    </span>

                                    <span className="text-xl font-bold">
                                        ₹
                                        {Number(
                                            total
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>
                                </div>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/checkout"
                                        )
                                    }
                                    className="w-full bg-black text-white py-3.5 rounded-xl font-semibold mt-6 hover:bg-gray-800 transition"
                                >
                                    Proceed to Checkout
                                </button>

                                <p className="text-xs text-gray-400 text-center mt-4">
                                    Taxes and final shipping
                                    charges will be shown at
                                    checkout.
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Cart;