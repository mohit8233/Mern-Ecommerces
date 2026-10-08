import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    MapPin,
    Check,
    Plus,
    CreditCard,
    Banknote,
    ShoppingBag
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useAddress } from "../context/AddressContext";

const Checkout = () => {
    const { user } = useAuth();
    const { cart, loading: cartLoading, refreshCart } = useCart();
    const {
        addresses,
        loading: addressLoading,
        getDefaultAddress
    } = useAddress();

    const navigate = useNavigate();

    const [selectedAddressId, setSelectedAddressId] =
        useState(null);

    const [paymentMethod, setPaymentMethod] =
        useState("razorpay");

    const [placingOrder, setPlacingOrder] =
        useState(false);

    const [error, setError] = useState("");

    // ==========================================
    // SELECT DEFAULT ADDRESS
    // ==========================================

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddress = getDefaultAddress();

            if (defaultAddress) {
                setSelectedAddressId(
                    defaultAddress._id
                );
            } else {
                setSelectedAddressId(
                    addresses[0]._id
                );
            }
        }
    }, [addresses, selectedAddressId, getDefaultAddress]);

    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!user) {
        return (
            <main className="flex min-h-[65vh] items-center justify-center px-4">
                <div className="text-center">
                    <ShoppingBag
                        size={50}
                        className="mx-auto mb-4 text-gray-300"
                    />

                    <h1 className="text-2xl font-bold text-gray-900">
                        Login Required
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Please login to continue checkout.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/login")
                        }
                        className="mt-6 rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
                    >
                        Login
                    </button>
                </div>
            </main>
        );
    }

    // ==========================================
    // LOADING
    // ==========================================

    if (cartLoading || addressLoading) {
        return (
            <main className="flex min-h-[65vh] items-center justify-center">
                <p className="text-gray-500">
                    Loading checkout...
                </p>
            </main>
        );
    }

    // ==========================================
    // EMPTY CART
    // ==========================================

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <main className="flex min-h-[65vh] items-center justify-center px-4">
                <div className="text-center">
                    <ShoppingBag
                        size={55}
                        className="mx-auto mb-4 text-gray-300"
                    />

                    <h1 className="text-2xl font-bold text-gray-900">
                        Your cart is empty
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Add some products before checkout.
                    </p>

                    <Link
                        to="/shop"
                        className="mt-6 inline-flex rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </main>
        );
    }

    // ==========================================
    // CALCULATIONS
    // ==========================================

    const subtotal =
        Number(cart.subtotal) || 0;

    const shippingCharge =
        subtotal >= 999 ? 0 : 50;

    const tax = Math.round(
        subtotal * 0.18
    );

    const discount = 0;

    const total =
        subtotal +
        shippingCharge +
        tax -
        discount;

    // ==========================================
    // PLACE ORDER
    // ==========================================

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            setError(
                "Please select a delivery address."
            );
            return;
        }

        try {
            setPlacingOrder(true);
            setError("");

            const response = await api.post(
                "/orders",
                {
                    addressId: selectedAddressId,
                    paymentMethod
                }
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                        "Unable to create order"
                );
            }

            const order = response.data.order;

            // Razorpay will be connected in next step
            if (paymentMethod === "razorpay") {
                navigate(
                    `/payment/${order._id}`
                );
                return;
            }

            // COD order is already completed
            await refreshCart();

            navigate(
                `/order-success/${order._id}`
            );
        } catch (error) {
    console.error("PLACE ORDER FULL ERROR:", error);

    console.error(
        "Response:",
        error.response?.data
    );

    console.error(
        "Status:",
        error.response?.status
    );

    setError(
        error.response?.data?.message ||
        error.message ||
        "Unable to place order"
    );
} finally {
    setPlacingOrder(false);
}
    };

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Checkout
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Complete your order
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

                    {/* LEFT */}
                    <div className="space-y-6">

                        {/* ADDRESS */}
                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                        <MapPin
                                            size={20}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-gray-900">
                                            Delivery Address
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Select where you want your order delivered
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    to="/addresses"
                                    className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-black"
                                >
                                    <Plus size={16} />
                                    Add
                                </Link>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
                                    <p className="text-sm text-gray-500">
                                        No delivery address found.
                                    </p>

                                    <Link
                                        to="/addresses"
                                        className="mt-4 inline-flex rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white"
                                    >
                                        Add Address
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map(
                                        (address) => {
                                            const selected =
                                                selectedAddressId ===
                                                address._id;

                                            return (
                                                <button
                                                    key={
                                                        address._id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedAddressId(
                                                            address._id
                                                        )
                                                    }
                                                    className={`w-full rounded-xl border p-4 text-left transition ${
                                                        selected
                                                            ? "border-black bg-gray-50"
                                                            : "border-gray-200 hover:border-gray-400"
                                                    }`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div
                                                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                                                selected
                                                                    ? "border-black bg-black text-white"
                                                                    : "border-gray-300"
                                                            }`}
                                                        >
                                                            {selected && (
                                                                <Check
                                                                    size={
                                                                        13
                                                                    }
                                                                />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="font-bold text-gray-900">
                                                                    {
                                                                        address.fullName
                                                                    }
                                                                </h3>

                                                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold capitalize text-gray-600">
                                                                    {
                                                                        address.addressType
                                                                    }
                                                                </span>

                                                                {address.isDefault && (
                                                                    <span className="rounded-full bg-black px-2 py-0.5 text-xs font-semibold text-white">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-sm text-gray-600">
                                                                {
                                                                    address.phone
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                                                {
                                                                    address.addressLine1
                                                                }

                                                                {address.addressLine2 &&
                                                                    `, ${address.addressLine2}`}

                                                                ,{" "}
                                                                {
                                                                    address.city
                                                                }
                                                                ,{" "}
                                                                {
                                                                    address.state
                                                                }{" "}
                                                                -{" "}
                                                                {
                                                                    address.postalCode
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </section>

                        {/* PAYMENT */}
                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                    <CreditCard
                                        size={20}
                                    />
                                </div>

                                <div>
                                    <h2 className="font-bold text-gray-900">
                                        Payment Method
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Choose your preferred payment method
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">

                                {/* Razorpay */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPaymentMethod(
                                            "razorpay"
                                        )
                                    }
                                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                                        paymentMethod ===
                                        "razorpay"
                                            ? "border-black bg-gray-50"
                                            : "border-gray-200 hover:border-gray-400"
                                    }`}
                                >
                                    <div
                                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                            paymentMethod ===
                                            "razorpay"
                                                ? "border-black bg-black"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        {paymentMethod ===
                                            "razorpay" && (
                                            <span className="h-2 w-2 rounded-full bg-white" />
                                        )}
                                    </div>

                                    <CreditCard
                                        size={21}
                                    />

                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            Razorpay
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            UPI, Cards, Net Banking & Wallets
                                        </p>
                                    </div>
                                </button>

                                {/* COD */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPaymentMethod(
                                            "cod"
                                        )
                                    }
                                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                                        paymentMethod ===
                                        "cod"
                                            ? "border-black bg-gray-50"
                                            : "border-gray-200 hover:border-gray-400"
                                    }`}
                                >
                                    <div
                                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                            paymentMethod ===
                                            "cod"
                                                ? "border-black bg-black"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        {paymentMethod ===
                                            "cod" && (
                                            <span className="h-2 w-2 rounded-full bg-white" />
                                        )}
                                    </div>

                                    <Banknote
                                        size={21}
                                    />

                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            Cash on Delivery
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Pay when your order arrives
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </section>

                        {/* PRODUCTS */}
                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="font-bold text-gray-900">
                                    Order Items
                                </h2>

                                <span className="text-sm text-gray-500">
                                    {cart.totalItems} items
                                </span>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {cart.items.map(
                                    (item) => {
                                        const product =
                                            item.product;

                                        const price =
                                            product.discountPrice !==
                                                null &&
                                            product.discountPrice !==
                                                undefined
                                                ? product.discountPrice
                                                : product.price;

                                        return (
                                            <div
                                                key={
                                                    item._id
                                                }
                                                className="flex gap-4 py-4 first:pt-0 last:pb-0"
                                            >
                                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                    <img
                                                        src={
                                                            product
                                                                .images?.[0]
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="line-clamp-2 font-semibold text-gray-900">
                                                        {
                                                            product.name
                                                        }
                                                    </h3>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Qty:{" "}
                                                        {
                                                            item.quantity
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                                        ₹
                                                        {Number(
                                                            price
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="font-bold text-gray-900">
                                                    ₹
                                                    {Number(
                                                        price *
                                                            item.quantity
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>

                            <Link
                                to="/cart"
                                className="mt-5 inline-block text-sm font-semibold text-gray-600 hover:text-black"
                            >
                                ← Edit Cart
                            </Link>
                        </section>
                    </div>

                    {/* RIGHT - SUMMARY */}
                    <aside className="h-fit lg:sticky lg:top-24">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Order Summary
                            </h2>

                            <div className="mt-6 space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Subtotal
                                    </span>

                                    <span className="font-semibold text-gray-900">
                                        ₹
                                        {subtotal.toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Shipping
                                    </span>

                                    <span className="font-semibold text-gray-900">
                                        {shippingCharge ===
                                        0
                                            ? "FREE"
                                            : `₹${shippingCharge}`}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        GST (18%)
                                    </span>

                                    <span className="font-semibold text-gray-900">
                                        ₹
                                        {tax.toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>
                                            Discount
                                        </span>

                                        <span>
                                            -₹
                                            {discount.toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="my-6 border-t border-gray-200" />

                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-gray-900">
                                    Total
                                </span>

                                <span className="text-2xl font-bold text-gray-900">
                                    ₹
                                    {total.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={
                                    placingOrder ||
                                    !selectedAddressId ||
                                    addresses.length ===
                                        0
                                }
                                className="mt-6 w-full rounded-xl bg-black px-5 py-4 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {placingOrder
                                    ? "Processing..."
                                    : paymentMethod ===
                                      "razorpay"
                                    ? "Continue to Payment"
                                    : "Place Order"}
                            </button>

                            <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                                By placing your order, you agree
                                to our terms and conditions.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default Checkout;