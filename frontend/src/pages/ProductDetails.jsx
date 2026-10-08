import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Heart,
    Minus,
    Plus,
    ShoppingCart,
    Star,
    Truck,
    ShieldCheck,
    RotateCcw,
    Loader2
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
  
    const { user } = useAuth();
    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/products/${id}`);

            const productData = response.data?.product;

            if (!productData) {
                throw new Error("Product not found");
            }

            setProduct(productData);

            if (productData.category?._id) {
                try {
                    const relatedResponse = await api.get(
                        `/products?category=${productData.category._id}&limit=4`
                    );

                    const products =
                        relatedResponse.data?.products || [];

                    setRelatedProducts(
                        products.filter(
                            (item) => item._id !== productData._id
                        ).slice(0, 4)
                    );
                } catch (relatedError) {
                    console.error(
                        "Related products error:",
                        relatedError
                    );
                }
            }
        } catch (err) {
            console.error(
                "Product details error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                    "Unable to load product."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const increaseQuantity = () => {
        if (quantity < product.stock) {
            setQuantity((prev) => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

const handleAddToCart = async () => {
    if (!user) {
        navigate("/login");
        return;
    }

    try {
        const response = await api.post("/cart/add", {
            productId: product._id,
            quantity
        });

        console.log("Cart response:", response.data);

        alert("Product added to cart successfully!");

        navigate("/cart");
    } catch (error) {
        console.error("Add to cart error:", error.response?.data || error.message);

        alert(
            error.response?.data?.message ||
            "Unable to add product to cart"
        );
    }
};

    const handleWishlist = () => {
        // Wishlist API next step mein connect karenge.
        navigate("/wishlist");
    };

    if (loading) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center">
                <Loader2
                    size={38}
                    className="animate-spin"
                />
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">
                        Product Not Found
                    </h1>

                    <p className="text-gray-500 mt-3">
                        {error || "This product does not exist."}
                    </p>

                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 mt-6 bg-black text-white px-6 py-3 rounded-xl font-semibold"
                    >
                        <ArrowLeft size={18} />
                        Back to Shop
                    </Link>
                </div>
            </main>
        );
    }

    const images =
        product.images?.length > 0
            ? product.images
            : [
                  "https://via.placeholder.com/700x700?text=No+Image"
              ];

    const hasDiscount =
        product.discountPrice !== null &&
        product.discountPrice !== undefined &&
        Number(product.discountPrice) < Number(product.price);

    const finalPrice = hasDiscount
        ? product.discountPrice
        : product.price;

    const discountPercentage = hasDiscount
        ? Math.round(
              ((product.price - product.discountPrice) /
                  product.price) *
                  100
          )
        : 0;

    return (
        <main className="bg-white">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link
                        to="/"
                        className="hover:text-black"
                    >
                        Home
                    </Link>

                    <span>/</span>

                    <Link
                        to="/shop"
                        className="hover:text-black"
                    >
                        Shop
                    </Link>

                    <span>/</span>

                    <span className="text-gray-900 truncate">
                        {product.name}
                    </span>
                </div>
            </div>

            {/* Product */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

                    {/* Images */}
                    <div>
                        <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden">
                            <img
                                src={images[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />

                            {hasDiscount && (
                                <span className="absolute top-5 left-5 bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                                    {discountPercentage}% OFF
                                </span>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="grid grid-cols-5 gap-3 mt-4">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            setSelectedImage(
                                                index
                                            )
                                        }
                                        className={`aspect-square rounded-xl overflow-hidden border-2 ${
                                            selectedImage ===
                                            index
                                                ? "border-black"
                                                : "border-transparent"
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Information */}
                    <div className="flex flex-col">
                        <p className="text-sm uppercase tracking-widest text-gray-500 font-semibold">
                            {product.brand || "Shopora"}
                        </p>

                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 mt-3 leading-tight">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-3 mt-5">
                            <div className="flex items-center gap-1">
                                <Star
                                    size={18}
                                    className="fill-yellow-400 text-yellow-400"
                                />

                                <span className="font-semibold">
                                    {Number(
                                        product.rating || 0
                                    ).toFixed(1)}
                                </span>
                            </div>

                            <span className="text-gray-300">
                                |
                            </span>

                            <span className="text-sm text-gray-500">
                                {product.numReviews || 0} Reviews
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3 mt-7">
                            <span className="text-3xl font-bold">
                                ₹
                                {Number(
                                    finalPrice || 0
                                ).toLocaleString("en-IN")}
                            </span>

                            {hasDiscount && (
                                <>
                                    <span className="text-lg text-gray-400 line-through">
                                        ₹
                                        {Number(
                                            product.price
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>

                                    <span className="text-sm font-semibold text-green-600">
                                        Save{" "}
                                        {discountPercentage}%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Short Description */}
                        {product.shortDescription && (
                            <p className="text-gray-600 leading-7 mt-6">
                                {product.shortDescription}
                            </p>
                        )}

                        <div className="border-t border-gray-200 my-7" />

                        {/* Stock */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">
                                Availability
                            </span>

                            {product.stock > 0 ? (
                                <span className="text-sm font-semibold text-green-600">
                                    In Stock ({product.stock})
                                </span>
                            ) : (
                                <span className="text-sm font-semibold text-red-600">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Quantity */}
                        {product.stock > 0 && (
                            <div className="mt-6">
                                <p className="text-sm font-semibold mb-3">
                                    Quantity
                                </p>

                                <div className="flex items-center border border-gray-300 rounded-xl w-fit overflow-hidden">
                                    <button
                                        onClick={
                                            decreaseQuantity
                                        }
                                        disabled={
                                            quantity <= 1
                                        }
                                        className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                                    >
                                        <Minus size={17} />
                                    </button>

                                    <span className="w-12 text-center font-semibold">
                                        {quantity}
                                    </span>

                                    <button
                                        onClick={
                                            increaseQuantity
                                        }
                                        disabled={
                                            quantity >=
                                            product.stock
                                        }
                                        className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                                    >
                                        <Plus size={17} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-7">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                                className="flex-1 h-14 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart size={20} />
                                Add to Cart
                            </button>

                            <button
                                onClick={handleWishlist}
                                className="w-14 h-14 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-100 transition"
                                title="Add to Wishlist"
                            >
                                <Heart size={21} />
                            </button>
                        </div>

                        {/* Benefits */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
                            <div className="border border-gray-200 rounded-xl p-4">
                                <Truck size={20} />
                                <p className="font-semibold text-sm mt-3">
                                    Fast Delivery
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Quick delivery
                                </p>
                            </div>

                            <div className="border border-gray-200 rounded-xl p-4">
                                <ShieldCheck size={20} />
                                <p className="font-semibold text-sm mt-3">
                                    Secure Payment
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    100% secure
                                </p>
                            </div>

                            <div className="border border-gray-200 rounded-xl p-4">
                                <RotateCcw size={20} />
                                <p className="font-semibold text-sm mt-3">
                                    Easy Returns
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Simple returns
                                </p>
                            </div>
                        </div>

                        {/* SKU */}
                        <div className="mt-7 text-sm text-gray-500">
                            SKU:{" "}
                            <span className="text-gray-900 font-medium">
                                {product.sku}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Description */}
            <section className="border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                    <h2 className="text-2xl font-bold">
                        Product Description
                    </h2>

                    <p className="text-gray-600 leading-8 mt-5 max-w-4xl whitespace-pre-line">
                        {product.description}
                    </p>
                </div>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="bg-gray-50 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <p className="text-sm uppercase tracking-widest text-gray-500">
                                    You may also like
                                </p>

                                <h2 className="text-3xl font-bold mt-2">
                                    Related Products
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {relatedProducts.map(
                                (item) => (
                                    <Link
                                        key={item._id}
                                        to={`/product/${item._id}`}
                                        className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition"
                                    >
                                        <div className="aspect-square bg-gray-100">
                                            <img
                                                src={
                                                    item
                                                        .images?.[0] ||
                                                    "https://via.placeholder.com/500x500?text=No+Image"
                                                }
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="p-4">
                                            <h3 className="font-semibold line-clamp-2">
                                                {item.name}
                                            </h3>

                                            <p className="font-bold mt-2">
                                                ₹
                                                {Number(
                                                    item.discountPrice ??
                                                        item.price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </p>
                                        </div>
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
};

export default ProductDetails;