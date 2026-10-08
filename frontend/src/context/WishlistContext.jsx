import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();

    const [wishlist, setWishlist] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {
        if (!user) {
            setWishlist([]);
            setWishlistCount(0);
            return;
        }

        try {
            setLoading(true);

            const response = await api.get("/wishlist");

            if (response.data.success) {
                const products =
                    response.data.wishlist?.products || [];

                setWishlist(products);
                setWishlistCount(products.length);
            }
        } catch (error) {
            console.error(
                "Fetch wishlist error:",
                error.response?.data || error.message
            );

            setWishlist([]);
            setWishlistCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchWishlist();
        }
    }, [user, authLoading]);

    const addToWishlist = async (productId) => {
        const response = await api.post("/wishlist/add", {
            productId
        });

        await fetchWishlist();

        return response.data;
    };

    const removeFromWishlist = async (productId) => {
        const response = await api.delete(
            `/wishlist/remove/${productId}`
        );

        await fetchWishlist();

        return response.data;
    };

    const isWishlisted = (productId) => {
        return wishlist.some(
            (product) =>
                product?._id?.toString() === productId?.toString()
        );
    };

    const toggleWishlist = async (productId) => {
        if (isWishlisted(productId)) {
            return await removeFromWishlist(productId);
        }

        return await addToWishlist(productId);
    };

    const moveToCart = async (productId) => {
        const response = await api.post(
            "/wishlist/move-to-cart",
            {
                productId
            }
        );

        await fetchWishlist();

        return response.data;
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                wishlistCount,
                loading,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isWishlisted,
                moveToCart,
                refreshWishlist: fetchWishlist
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);