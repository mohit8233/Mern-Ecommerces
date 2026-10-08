import { useNavigate } from "react-router-dom";
import {
    Heart,
    ShoppingCart,
    Trash2,
    ArrowLeft
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

const Wishlist = () => {
    const { user } = useAuth();

    const {
        wishlist,
        loading,
        removeFromWishlist,
        moveToCart
    } = useWishlist();

    const navigate = useNavigate();

    const handleRemove = async (productId) => {
        try {
            await removeFromWishlist(productId);
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to remove product"
            );
        }
    };

    const handleMoveToCart = async (productId) => {
        try {
            await moveToCart(productId);

            alert("Product moved to cart!");

            navigate("/cart");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to move product to cart"
            );
        }
    };

    if (!user) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
                <div className="text-center">

                    <Heart
                        size={55}
                        className="mx-auto mb-5 text-gray-300"
                    />

                    <h1 className="text-2xl font-bold text-gray-900">
                        Login to view your wishlist
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Save your favorite products for later.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="mt-6 rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
                    >
                        Login
                    </button>

                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-10">

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">

                    <button
                        onClick={() => navigate("/shop")}
                        className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
                    >
                        <ArrowLeft size={17} />
                        Continue Shopping
                    </button>

                    <div className="flex items-center justify-between">

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                My Wishlist
                            </h1>

                            <p className="mt-1 text-gray-500">
                                {wishlist.length}{" "}
                                {wishlist.length === 1
                                    ? "product"
                                    : "products"}{" "}
                                saved
                            </p>
                        </div>

                        <Heart
                            size={32}
                            className="hidden fill-red-500 text-red-500 sm:block"
                        />

                    </div>

                </div>


                {/* Loading */}
                {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
                    </div>
                ) : wishlist.length === 0 ? (

                    /* Empty Wishlist */
                    <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">

                        <Heart
                            size={60}
                            className="mx-auto mb-5 text-gray-300"
                        />

                        <h2 className="text-2xl font-bold text-gray-900">
                            Your wishlist is empty
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-gray-500">
                            You haven't saved any products yet.
                            Explore our shop and add products you love.
                        </p>

                        <button
                            onClick={() => navigate("/shop")}
                            className="mt-7 rounded-lg bg-black px-7 py-3 font-semibold text-white transition hover:bg-gray-800"
                        >
                            Explore Shop
                        </button>

                    </div>

                ) : (

                    /* Wishlist Products */
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {wishlist.map((product) => {

                            const price =
                                product.discountPrice !== null &&
                                product.discountPrice !== undefined
                                    ? product.discountPrice
                                    : product.price;

                            return (
                                <div
                                    key={product._id}
                                    className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                >

                                    {/* Image */}
                                    <div
                                        onClick={() =>
                                            navigate(
                                                `/product/${product._id}`
                                            )
                                        }
                                        className="relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
                                    >

                                        <img
                                            src={
                                                product.images?.[0] ||
                                                "https://via.placeholder.com/500"
                                            }
                                            alt={product.name}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(product._id);
                                            }}
                                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-red-50"
                                        >
                                            <Trash2
                                                size={17}
                                                className="text-red-500"
                                            />
                                        </button>

                                    </div>


                                    {/* Content */}
                                    <div className="p-4">

                                        {product.brand && (
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                {product.brand}
                                            </p>
                                        )}

                                        <h3
                                            onClick={() =>
                                                navigate(
                                                    `/product/${product._id}`
                                                )
                                            }
                                            className="mt-1 cursor-pointer truncate text-base font-semibold text-gray-900 hover:text-gray-600"
                                        >
                                            {product.name}
                                        </h3>


                                        <div className="mt-2 flex items-center gap-2">

                                            <span className="text-lg font-bold text-gray-900">
                                                ₹{price}
                                            </span>

                                            {product.discountPrice !== null &&
                                                product.discountPrice !== undefined && (
                                                    <span className="text-sm text-gray-400 line-through">
                                                        ₹{product.price}
                                                    </span>
                                                )}

                                        </div>


                                        <button
                                            onClick={() =>
                                                handleMoveToCart(
                                                    product._id
                                                )
                                            }
                                            disabled={product.stock <= 0}
                                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                                        >
                                            <ShoppingCart size={17} />

                                            {product.stock > 0
                                                ? "Move to Cart"
                                                : "Out of Stock"}
                                        </button>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                )}

            </div>

        </main>
    );
};

export default Wishlist;