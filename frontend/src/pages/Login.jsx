import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
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
            const response = await login(
                formData.email,
                formData.password
            );

            if (response.success) {
                navigate("/");
            } else {
                setError(response.message || "Login failed");
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-md">

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

                    <div className="text-center mb-8">

                        <div className="w-14 h-14 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Lock size={26} />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome Back
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Login to your account
                        </p>

                    </div>

                    {error && (
                        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
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
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 outline-none focus:border-black transition"
                                />

                            </div>

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>

                            <div className="relative">

                                <Lock
                                    size={19}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 outline-none focus:border-black transition"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>

                            </div>

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >

                            {loading ? (
                                <>
                                    <Loader2
                                        size={20}
                                        className="animate-spin"
                                    />
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}

                        </button>

                    </form>

                    <p className="text-center text-gray-500 text-sm mt-7">

                        Don't have an account?{" "}

                        <Link
                            to="/register"
                            className="font-semibold text-black hover:underline"
                        >
                            Create account
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
};

export default Login;