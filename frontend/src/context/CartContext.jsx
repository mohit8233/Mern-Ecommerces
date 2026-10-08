import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();

    const [cart, setCart] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        if (!user) {
            setCart(null);
            setCartCount(0);
            return;
        }

        try {
            setLoading(true);

            const response = await api.get("/cart");

            if (response.data.success) {
                const cartData = response.data.cart;

                setCart(cartData);
                setCartCount(cartData.totalItems || 0);
            }
        } catch (error) {
            console.error(
                "Fetch cart error:",
                error.response?.data || error.message
            );

            setCart(null);
            setCartCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchCart();
        }
    }, [user, authLoading]);

    const refreshCart = async () => {
        await fetchCart();
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                cartCount,
                loading,
                refreshCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);