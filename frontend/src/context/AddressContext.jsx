import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();

    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAddresses = async () => {
        if (!user) {
            setAddresses([]);
            return;
        }

        try {
            setLoading(true);

            const response = await api.get("/addresses");

            if (response.data.success) {
                setAddresses(response.data.addresses || []);
            }
        } catch (error) {
            console.error(
                "Fetch addresses error:",
                error.response?.data || error.message
            );

            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchAddresses();
        }
    }, [user, authLoading]);

    const addAddress = async (addressData) => {
        const response = await api.post("/addresses", addressData);

        await fetchAddresses();

        return response.data;
    };

    const updateAddress = async (id, addressData) => {
        const response = await api.put(
            `/addresses/${id}`,
            addressData
        );

        await fetchAddresses();

        return response.data;
    };

    const setDefaultAddress = async (id) => {
        const response = await api.patch(
            `/addresses/${id}/default`
        );

        await fetchAddresses();

        return response.data;
    };

    const deleteAddress = async (id) => {
        const response = await api.delete(
            `/addresses/${id}`
        );

        await fetchAddresses();

        return response.data;
    };

    const getDefaultAddress = () => {
        return addresses.find((address) => address.isDefault) || null;
    };

    return (
        <AddressContext.Provider
            value={{
                addresses,
                loading,
                addAddress,
                updateAddress,
                setDefaultAddress,
                deleteAddress,
                getDefaultAddress,
                refreshAddresses: fetchAddresses
            }}
        >
            {children}
        </AddressContext.Provider>
    );
};

export const useAddress = () => useContext(AddressContext);