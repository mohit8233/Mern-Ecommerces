import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    User
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await register(
                formData.name,
                formData.email,
                formData.password
            );

            if (response.success) {
                navigate("/");
            } else {
                setError(response.message || "Registration failed");
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

            <div className="w-full max-w-lg">

                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">

                    {/* Header */}
                    <div className="text-center mb-8">

                        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center">
                            <User size={30} />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Create Account
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Create your account and start shopping
                        </p>

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Name */}
                        <div>

                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Full Name
                            </label>

                            <div className="relative">

                                <User
                                    size={19}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                    minLength={2}
                                    className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-gray-200 transition"
                                />

                            </div>

                        </div>

                        {/* Email */}
                        <div>

                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Email Address
                            </label>

                            <div className="relative">

                                <Mail
                                    size={19}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-gray-200 transition"
                                />

                            </div>

                        </div>

                        {/* Password */}
                        <div>

                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Password
                            </label>

                            <div className="relative">

                                <Lock
                                    size={19}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Minimum 6 characters"
                                    required
                                    minLength={6}
                                    className="w-full h-12 pl-10 pr-12 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-gray-200 transition"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition"
                                >
                                    {showPassword ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >

                            {loading ? (
                                <>
                                    <Loader2
                                        size={20}
                                        className="animate-spin"
                                    />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}

                        </button>

                    </form>

                    {/* Login */}
                    <p className="text-center text-sm text-gray-500 mt-7">

                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="font-semibold text-black hover:underline"
                        >
                            Login
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
};

export default Register;

