import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
    const { user } = useAuth();
const { toggleWishlist, isWishlisted } = useWishlist();

const navigate = useNavigate();

const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
        navigate("/login");
        return;
    }

    try {
        await toggleWishlist(product._id);
    } catch (error) {
        console.error(
            "Wishlist error:",
            error.response?.data || error.message
        );

        alert(
            error.response?.data?.message ||
            "Unable to update wishlist"
        );
    }
};
    const image =
        product?.images?.[0] ||
        "https://via.placeholder.com/500x500?text=No+Image";

    const hasDiscount =
        product?.discountPrice !== null &&
        product?.discountPrice !== undefined &&
        Number(product.discountPrice) < Number(product.price);

    const finalPrice = hasDiscount
        ? product.discountPrice
        : product.price;

    return (
        <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition duration-300">
            {/* Image */}
            <div className="relative bg-gray-100 aspect-square overflow-hidden">
                <Link to={`/product/${product._id}`}>
                    <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                </Link>

                {/* Discount */}
                {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        SALE
                    </span>
                )}

                {/* Wishlist */}
               <button
    onClick={handleWishlist}
    className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-105"
>
    <Heart
        size={18}
        className={
            isWishlisted(product._id)
                ? "fill-red-500 text-red-500"
                : "text-gray-700"
        }
    />
</button>

                {/* Quick Cart */}
                <button
                    type="button"
                    className="absolute bottom-3 left-3 right-3 bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300"
                >
                    <ShoppingCart size={17} />
                    Add to Cart
                </button>
            </div>

            {/* Details */}
            <div className="p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    {product?.brand || "Shopora"}
                </p>

                <Link to={`/product/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-gray-600 transition">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-3">
                    <Star
                        size={15}
                        className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="text-sm font-medium">
                        {Number(product?.rating || 0).toFixed(1)}
                    </span>

                    <span className="text-xs text-gray-400">
                        ({product?.numReviews || 0})
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mt-3">
                    <span className="text-lg font-bold text-gray-900">
                        ₹{Number(finalPrice || 0).toLocaleString("en-IN")}
                    </span>

                    {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;