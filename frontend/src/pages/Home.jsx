import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Truck,
    ShieldCheck,
    RotateCcw,
    Headphones,
    Loader2
} from "lucide-react";

import api from "../services/api";
import ProductCard from "../components/ProductCard";

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHomeData = async () => {
        try {
            setLoading(true);

            const [categoryResponse, productResponse] =
                await Promise.all([
                    api.get("/categories"),
                    api.get("/products?featured=true&limit=8")
                ]);

            setCategories(
                categoryResponse.data?.categories || []
            );

            setProducts(
                productResponse.data?.products || []
            );
        } catch (error) {
            console.error(
                "Home page data error:",
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomeData();
    }, []);

    return (
        <main>
            {/* ================= HERO ================= */}
            <section className="bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="min-h-[620px] grid grid-cols-1 lg:grid-cols-2 items-center gap-10 py-16">

                        {/* Left */}
                        <div>
                            <span className="inline-flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 mb-6">
                                New Collection 2026
                            </span>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-950 leading-[1.05] tracking-tight">
                                Shop smarter.
                                <br />
                                <span className="text-gray-500">
                                    Live better.
                                </span>
                            </h1>

                            <p className="mt-6 text-gray-600 text-base sm:text-lg leading-7 max-w-xl">
                                Discover quality products at great prices.
                                From everyday essentials to trending
                                collections, everything you need is here.
                            </p>

                            <div className="flex flex-wrap gap-4 mt-8">
                                <Link
                                    to="/shop"
                                    className="inline-flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition"
                                >
                                    Shop Now
                                    <ArrowRight size={18} />
                                </Link>

                                <Link
                                    to="/categories"
                                    className="inline-flex items-center gap-2 bg-white text-gray-900 border border-gray-300 px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition"
                                >
                                    Browse Categories
                                </Link>
                            </div>

                            {/* Small Stats */}
                            <div className="flex flex-wrap gap-8 mt-10">
                                <div>
                                    <p className="text-2xl font-bold">
                                        10K+
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Products
                                    </p>
                                </div>

                                <div>
                                    <p className="text-2xl font-bold">
                                        5K+
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Happy Customers
                                    </p>
                                </div>

                                <div>
                                    <p className="text-2xl font-bold">
                                        4.8/5
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Customer Rating
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right */}
                        <div className="relative">
                            <div className="aspect-square max-w-lg mx-auto bg-white rounded-[2rem] overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85"
                                    alt="Shopping collection"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="absolute -bottom-5 -left-2 sm:left-0 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center">
                                    <Truck size={21} />
                                </div>

                                <div>
                                    <p className="font-semibold text-sm">
                                        Fast Delivery
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Across India
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= CATEGORIES ================= */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex items-end justify-between gap-4 mb-8">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                                Explore
                            </p>

                            <h2 className="text-3xl sm:text-4xl font-bold mt-2">
                                Shop by Category
                            </h2>
                        </div>

                        <Link
                            to="/categories"
                            className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                        >
                            View All
                            <ArrowRight size={17} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2
                                size={30}
                                className="animate-spin"
                            />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="border border-dashed border-gray-300 rounded-2xl py-16 text-center">
                            <p className="text-gray-500">
                                No categories available yet.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {categories.slice(0, 6).map((category) => (
                                <Link
                                    key={category._id}
                                    to={`/shop?category=${category._id}`}
                                    className="group"
                                >
                                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                                        <img
                                            src={
                                                category.image ||
                                                "https://via.placeholder.com/400x400?text=Category"
                                            }
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    </div>

                                    <h3 className="font-semibold text-center mt-3 group-hover:text-gray-500 transition">
                                        {category.name}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ================= FEATURED PRODUCTS ================= */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex items-end justify-between gap-4 mb-8">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                                Our Picks
                            </p>

                            <h2 className="text-3xl sm:text-4xl font-bold mt-2">
                                Featured Products
                            </h2>
                        </div>

                        <Link
                            to="/shop"
                            className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                        >
                            Shop All
                            <ArrowRight size={17} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2
                                size={32}
                                className="animate-spin"
                            />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-300 rounded-2xl py-20 text-center">
                            <p className="text-gray-500">
                                No featured products available yet.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {products.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ================= FEATURES ================= */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-gray-200 rounded-2xl overflow-hidden">

                        <div className="p-7 border-b sm:border-r lg:border-b-0 border-gray-200">
                            <Truck size={28} />
                            <h3 className="font-bold mt-4">
                                Free Shipping
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Free delivery on eligible orders.
                            </p>
                        </div>

                        <div className="p-7 border-b lg:border-b-0 lg:border-r border-gray-200">
                            <ShieldCheck size={28} />
                            <h3 className="font-bold mt-4">
                                Secure Payment
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Safe and secure checkout.
                            </p>
                        </div>

                        <div className="p-7 border-b sm:border-b-0 sm:border-r border-gray-200">
                            <RotateCcw size={28} />
                            <h3 className="font-bold mt-4">
                                Easy Returns
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Simple return process for your orders.
                            </p>
                        </div>

                        <div className="p-7">
                            <Headphones size={28} />
                            <h3 className="font-bold mt-4">
                                24/7 Support
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                We are here whenever you need us.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-black text-white rounded-3xl px-6 sm:px-12 py-14 text-center">
                        <p className="text-gray-400 text-sm uppercase tracking-widest">
                            Ready to shop?
                        </p>

                        <h2 className="text-3xl sm:text-5xl font-bold mt-3">
                            Find something you'll love.
                        </h2>

                        <p className="text-gray-400 max-w-xl mx-auto mt-4">
                            Explore our latest collection and discover
                            products made for your everyday life.
                        </p>

                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 mt-7 bg-white text-black px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition"
                        >
                            Start Shopping
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;