import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getMe = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setUser(null);
                return;
            }

            const response = await api.get("/auth/me");

            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getMe();
    }, []);

    const login = async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password
        });

        if (response.data.success) {
            localStorage.setItem("token", response.data.token);
            setUser(response.data.user);
        }

        return response.data;
    };

    const register = async (name, email, password) => {
        const response = await api.post("/auth/register", {
            name,
            email,
            password
        });

        if (response.data.success) {
            localStorage.setItem("token", response.data.token);
            setUser(response.data.user);
        }

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                getMe
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};