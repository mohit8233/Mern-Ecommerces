
import { Link } from "react-router-dom";
import {
    Mail,
    MapPin,
    Phone
} from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gray-950 text-white mt-20">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div>

                        <div className="flex items-center gap-2 mb-5">

                            <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-bold text-lg">
                                C
                            </div>

                            <span className="text-xl font-bold">
                               Cartify
                            </span>

                        </div>

                        <p className="text-gray-400 text-sm leading-6 max-w-xs">
                            Discover quality products, great prices
                            and a simple shopping experience.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3 mt-6">

                            <a
                                href="#"
                                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition text-sm font-bold"
                            >
                                IG
                            </a>

                            <a
                                href="#"
                                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition text-sm font-bold"
                            >
                                FB
                            </a>

                            <a
                                href="#"
                                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition text-sm font-bold"
                            >
                                X
                            </a>

                        </div>

                    </div>

                    {/* Quick Links */}
                    <div>

                        <h3 className="font-semibold text-lg mb-5">
                            Quick Links
                        </h3>

                        <div className="space-y-3 text-sm">

                            <Link
                                to="/"
                                className="block text-gray-400 hover:text-white transition"
                            >
                                Home
                            </Link>

                            <Link
                                to="/shop"
                                className="block text-gray-400 hover:text-white transition"
                            >
                                Shop
                            </Link>

                            <Link
                                to="/categories"
                                className="block text-gray-400 hover:text-white transition"
                            >
                                Categories
                            </Link>

                            <Link
                                to="/wishlist"
                                className="block text-gray-400 hover:text-white transition"
                            >
                                Wishlist
                            </Link>

                        </div>

                    </div>

                    {/* Customer Service */}
                    <div>

                        <h3 className="font-semibold text-lg mb-5">
                            Customer Service
                        </h3>

                        <div className="space-y-3 text-sm">

                            <Link
                                to="/orders"
                                className="block text-gray-400 hover:text-white transition"
                            >
                                My Orders
                            </Link>

                            <Link
                                to="/profile"
                                className="block text-gray-400 hover:text-white transition"
                            >
                                My Account
                            </Link>

                            <a
                                href="#"
                                className="block text-gray-400 hover:text-white transition"
                            >
                                Privacy Policy
                            </a>

                            <a
                                href="#"
                                className="block text-gray-400 hover:text-white transition"
                            >
                                Terms & Conditions
                            </a>

                        </div>

                    </div>

                    {/* Contact */}
                    <div>

                        <h3 className="font-semibold text-lg mb-5">
                            Contact Us
                        </h3>

                        <div className="space-y-4 text-sm">

                            <div className="flex gap-3 text-gray-400">

                                <MapPin
                                    size={18}
                                    className="shrink-0 text-white"
                                />

                                <span>
                                    Jaipur, Rajasthan, India
                                </span>

                            </div>

                            <div className="flex gap-3 text-gray-400">

                                <Mail
                                    size={18}
                                    className="shrink-0 text-white"
                                />

                                <span>
                                    support@Cartify.com
                                </span>

                            </div>

                            <div className="flex gap-3 text-gray-400">

                                <Phone
                                    size={18}
                                    className="shrink-0 text-white"
                                />

                                <span>
                                    +91 98765 43210
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* Bottom */}
            <div className="border-t border-gray-800">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Cartify. All rights reserved.
                    </p>

                    <p className="text-gray-500 text-sm">
                        Built with MERN Stack
                    </p>

                </div>

            </div>

        </footer>
    );
};

export default Footer;

