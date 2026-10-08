import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    MapPin,
    Plus,
    Pencil,
    Trash2,
    Check,
    Home,
    Briefcase,
    MapPinned
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useAddress } from "../context/AddressContext";

const Addresses = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const {
        addresses,
        loading,
        addAddress,
        updateAddress,
        setDefaultAddress,
        deleteAddress
    } = useAddress();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const emptyForm = {
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        landmark: "",
        addressType: "home",
        isDefault: false
    };

    const [form, setForm] = useState(emptyForm);

    if (!user) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="text-center">
                    <MapPin
                        size={50}
                        className="mx-auto mb-4 text-gray-400"
                    />

                    <h2 className="text-2xl font-bold text-gray-900">
                        Login Required
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Please login to manage your addresses.
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const openAddForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setShowForm(true);
    };

    const openEditForm = (address) => {
        setEditingId(address._id);

        setForm({
            fullName: address.fullName || "",
            phone: address.phone || "",
            addressLine1: address.addressLine1 || "",
            addressLine2: address.addressLine2 || "",
            city: address.city || "",
            state: address.state || "",
            postalCode: address.postalCode || "",
            country: address.country || "India",
            landmark: address.landmark || "",
            addressType: address.addressType || "home",
            isDefault: address.isDefault || false
        });

        setError("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            if (editingId) {
                await updateAddress(editingId, form);
            } else {
                await addAddress(form);
            }

            closeForm();
        } catch (error) {
            console.error(
                "Save address error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to save address"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this address?"
        );

        if (!confirmed) return;

        try {
            setDeletingId(id);

            await deleteAddress(id);
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to delete address"
            );
        } finally {
            setDeletingId(null);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await setDefaultAddress(id);
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to set default address"
            );
        }
    };

    const getAddressIcon = (type) => {
        if (type === "work") {
            return <Briefcase size={18} />;
        }

        if (type === "other") {
            return <MapPinned size={18} />;
        }

        return <Home size={18} />;
    };

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Addresses
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Manage your delivery addresses
                        </p>
                    </div>

                    {!showForm && (
                        <button
                            onClick={openAddForm}
                            className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                        >
                            <Plus size={19} />
                            Add New Address
                        </button>
                    )}
                </div>

                {/* Form */}
                {showForm && (
                    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingId
                                        ? "Edit Address"
                                        : "Add New Address"}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Enter your delivery details
                                </p>
                            </div>

                            <button
                                onClick={closeForm}
                                className="text-sm font-medium text-gray-500 hover:text-black"
                            >
                                Cancel
                            </button>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Input
                                    label="Full Name"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    label="Phone Number"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="10 digit mobile number"
                                    maxLength={10}
                                    required
                                />
                            </div>

                            <Input
                                label="Address Line 1"
                                name="addressLine1"
                                value={form.addressLine1}
                                onChange={handleChange}
                                placeholder="House no, street, area"
                                required
                            />

                            <Input
                                label="Address Line 2"
                                name="addressLine2"
                                value={form.addressLine2}
                                onChange={handleChange}
                                placeholder="Apartment, floor, etc. (optional)"
                            />

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                <Input
                                    label="City"
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    label="State"
                                    name="state"
                                    value={form.state}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    label="Postal Code"
                                    name="postalCode"
                                    value={form.postalCode}
                                    onChange={handleChange}
                                    placeholder="6 digit PIN"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Input
                                    label="Country"
                                    name="country"
                                    value={form.country}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    label="Landmark"
                                    name="landmark"
                                    value={form.landmark}
                                    onChange={handleChange}
                                    placeholder="Nearby landmark (optional)"
                                />
                            </div>

                            {/* Address Type */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Address Type
                                </label>

                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        ["home", "Home", Home],
                                        ["work", "Work", Briefcase],
                                        ["other", "Other", MapPinned]
                                    ].map(
                                        ([
                                            value,
                                            label,
                                            Icon
                                        ]) => (
                                            <button
                                                type="button"
                                                key={value}
                                                onClick={() =>
                                                    setForm(
                                                        (prev) => ({
                                                            ...prev,
                                                            addressType:
                                                                value
                                                        })
                                                    )
                                                }
                                                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                                                    form.addressType ===
                                                    value
                                                        ? "border-black bg-black text-white"
                                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                                                }`}
                                            >
                                                <Icon size={17} />
                                                {label}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Default */}
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={form.isDefault}
                                    onChange={handleChange}
                                    className="h-4 w-4 accent-black"
                                />

                                <span className="text-sm font-medium text-gray-700">
                                    Make this my default address
                                </span>
                            </label>

                            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                        ? "Update Address"
                                        : "Save Address"}
                                </button>

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="py-20 text-center text-gray-500">
                        Loading addresses...
                    </div>
                ) : addresses.length === 0 ? (
                    /* Empty */
                    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                        <MapPin
                            size={50}
                            className="mx-auto mb-4 text-gray-300"
                        />

                        <h2 className="text-xl font-bold text-gray-900">
                            No addresses found
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Add your first delivery address.
                        </p>

                        {!showForm && (
                            <button
                                onClick={openAddForm}
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
                            >
                                <Plus size={18} />
                                Add Address
                            </button>
                        )}
                    </div>
                ) : (
                    /* Address List */
                    <div className="grid gap-5 md:grid-cols-2">
                        {addresses.map((address) => (
                            <div
                                key={address._id}
                                className={`relative rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                                    address.isDefault
                                        ? "border-black"
                                        : "border-gray-200"
                                }`}
                            >
                                {/* Default */}
                                {address.isDefault && (
                                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                                        <Check size={13} />
                                        Default
                                    </div>
                                )}

                                {/* Type */}
                                <div className="mb-5 flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                                        {getAddressIcon(
                                            address.addressType
                                        )}
                                    </div>

                                    <span className="font-semibold capitalize text-gray-900">
                                        {address.addressType}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="space-y-1 text-sm leading-6 text-gray-600">
                                    <h3 className="text-base font-bold text-gray-900">
                                        {address.fullName}
                                    </h3>

                                    <p>
                                        {address.phone}
                                    </p>

                                    <p>
                                        {address.addressLine1}
                                    </p>

                                    {address.addressLine2 && (
                                        <p>
                                            {address.addressLine2}
                                        </p>
                                    )}

                                    <p>
                                        {address.city},{" "}
                                        {address.state} -{" "}
                                        {address.postalCode}
                                    </p>

                                    <p>
                                        {address.country}
                                    </p>

                                    {address.landmark && (
                                        <p>
                                            Landmark:{" "}
                                            {address.landmark}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                                    <button
                                        onClick={() =>
                                            openEditForm(address)
                                        }
                                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        <Pencil size={15} />
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                address._id
                                            )
                                        }
                                        disabled={
                                            deletingId ===
                                            address._id
                                        }
                                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                    >
                                        <Trash2 size={15} />
                                        {deletingId ===
                                        address._id
                                            ? "Deleting..."
                                            : "Delete"}
                                    </button>

                                    {!address.isDefault && (
                                        <button
                                            onClick={() =>
                                                handleSetDefault(
                                                    address._id
                                                )
                                            }
                                            className="ml-auto rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
                                        >
                                            Make Default
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Back */}
                <div className="mt-8">
                    <Link
                        to="/"
                        className="text-sm font-semibold text-gray-600 hover:text-black"
                    >
                        ← Continue Shopping
                    </Link>
                </div>
            </div>
        </main>
    );
};

const Input = ({
    label,
    name,
    value,
    onChange,
    required = false,
    placeholder = "",
    maxLength
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
                {label}
            </label>

            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                maxLength={maxLength}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
        </div>
    );
};

export default Addresses;