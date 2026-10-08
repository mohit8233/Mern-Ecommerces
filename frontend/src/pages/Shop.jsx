import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    ChevronDown,
    Filter,
    Loader2,
    Search,
    X
} from "lucide-react";

import api from "../services/api";
import ProductCard from "../components/ProductCard";

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [mobileFilter, setMobileFilter] = useState(false);

    const [search, setSearch] = useState(
        searchParams.get("search") || ""
    );

    const [category, setCategory] = useState(
        searchParams.get("category") || ""
    );

    const [sort, setSort] = useState(
        searchParams.get("sort") || ""
    );

    const [page, setPage] = useState(
        Number(searchParams.get("page")) || 1
    );

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0
    });

    const limit = 12;

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories");

            setCategories(
                response.data?.categories || []
            );
        } catch (error) {
            console.error("Category error:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            params.set("page", page);
            params.set("limit", limit);

            if (search.trim()) {
                params.set("search", search.trim());
            }

            if (category) {
                params.set("category", category);
            }

            if (sort) {
                params.set("sort", sort);
            }

            const response = await api.get(
                `/products?${params.toString()}`
            );

            setProducts(
                response.data?.products || []
            );

            if (response.data?.pagination) {
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error(
                "Products error:",
                error.response?.data || error.message
            );

            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, category, sort, search]);

    useEffect(() => {
        const urlSearch = searchParams.get("search") || "";
        const urlCategory = searchParams.get("category") || "";
        const urlSort = searchParams.get("sort") || "";
        const urlPage = Number(searchParams.get("page")) || 1;

        setSearch(urlSearch);
        setCategory(urlCategory);
        setSort(urlSort);
        setPage(urlPage);
    }, [searchParams]);

    const updateFilters = ({
        newSearch = search,
        newCategory = category,
        newSort = sort,
        newPage = 1
    } = {}) => {
        const params = {};

        if (newSearch.trim()) {
            params.search = newSearch.trim();
        }

        if (newCategory) {
            params.category = newCategory;
        }

        if (newSort) {
            params.sort = newSort;
        }

        if (newPage > 1) {
            params.page = newPage;
        }

        setSearchParams(params);
    };

    const handleSearch = (e) => {
        e.preventDefault();

        updateFilters({
            newSearch: search,
            newCategory: category,
            newSort: sort,
            newPage: 1
        });
    };

    const handleCategory = (value) => {
        setCategory(value);

        updateFilters({
            newSearch: search,
            newCategory: value,
            newSort: sort,
            newPage: 1
        });
    };

    const handleSort = (value) => {
        setSort(value);

        updateFilters({
            newSearch: search,
            newCategory: category,
            newSort: value,
            newPage: 1
        });
    };

    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setSort("");
        setPage(1);

        setSearchParams({});
    };

    const handlePageChange = (newPage) => {
        if (
            newPage < 1 ||
            newPage > pagination.totalPages
        ) {
            return;
        }

        updateFilters({
            newSearch: search,
            newCategory: category,
            newSort: sort,
            newPage
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const activeCategory = categories.find(
        (item) => item._id === category
    );

    return (
        <main className="min-h-screen bg-white">
            {/* Header */}
            <section className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                        Shop
                    </p>

                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-950 mt-2">
                        Discover Products
                    </h1>

                    <p className="text-gray-500 mt-3 max-w-2xl">
                        Explore our collection and find products
                        you'll love.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Desktop Filters */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-28">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-bold text-lg">
                                    Filters
                                </h2>

                                {(search ||
                                    category ||
                                    sort) && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-gray-500 hover:text-black"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Search */}
                            <form
                                onSubmit={handleSearch}
                                className="mb-8"
                            >
                                <label className="text-sm font-semibold">
                                    Search
                                </label>

                                <div className="relative mt-2">
                                    <Search
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Search products"
                                        className="w-full h-11 border border-gray-300 rounded-xl pl-9 pr-3 outline-none focus:border-black text-sm"
                                    />
                                </div>
                            </form>

                            {/* Categories */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold mb-3">
                                    Categories
                                </h3>

                                <div className="space-y-1">
                                    <button
                                        onClick={() =>
                                            handleCategory("")
                                        }
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                                            !category
                                                ? "bg-black text-white"
                                                : "hover:bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        All Categories
                                    </button>

                                    {categories.map(
                                        (item) => (
                                            <button
                                                key={item._id}
                                                onClick={() =>
                                                    handleCategory(
                                                        item._id
                                                    )
                                                }
                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                                                    category ===
                                                    item._id
                                                        ? "bg-black text-white"
                                                        : "hover:bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {item.name}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Sort */}
                            <div>
                                <h3 className="text-sm font-semibold mb-3">
                                    Sort By
                                </h3>

                                <select
                                    value={sort}
                                    onChange={(e) =>
                                        handleSort(
                                            e.target.value
                                        )
                                    }
                                    className="w-full h-11 border border-gray-300 rounded-xl px-3 text-sm outline-none focus:border-black bg-white"
                                >
                                    <option value="">
                                        Default
                                    </option>
                                    <option value="price_asc">
                                        Price: Low to High
                                    </option>
                                    <option value="price_desc">
                                        Price: High to Low
                                    </option>
                                    <option value="newest">
                                        Newest
                                    </option>
                                    <option value="popular">
                                        Most Popular
                                    </option>
                                    <option value="rating">
                                        Top Rated
                                    </option>
                                </select>
                            </div>
                        </div>
                    </aside>

                    {/* Products */}
                    <section className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <p className="text-sm text-gray-500">
                                    {loading
                                        ? "Loading products..."
                                        : `${pagination.totalProducts || products.length} products found`}
                                </p>

                                {activeCategory && (
                                    <p className="text-sm font-semibold mt-1">
                                        {activeCategory.name}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() =>
                                        setMobileFilter(true)
                                    }
                                    className="lg:hidden flex items-center gap-2 border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-medium"
                                >
                                    <Filter size={17} />
                                    Filters
                                </button>

                                <div className="relative">
                                    <select
                                        value={sort}
                                        onChange={(e) =>
                                            handleSort(
                                                e.target.value
                                            )
                                        }
                                        className="appearance-none border border-gray-300 bg-white h-11 rounded-xl pl-4 pr-10 text-sm outline-none focus:border-black"
                                    >
                                        <option value="">
                                            Sort
                                        </option>
                                        <option value="price_asc">
                                            Price: Low to High
                                        </option>
                                        <option value="price_desc">
                                            Price: High to Low
                                        </option>
                                        <option value="newest">
                                            Newest
                                        </option>
                                        <option value="popular">
                                            Popular
                                        </option>
                                        <option value="rating">
                                            Top Rated
                                        </option>
                                    </select>

                                    <ChevronDown
                                        size={16}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {loading ? (
                            <div className="min-h-[400px] flex items-center justify-center">
                                <Loader2
                                    size={34}
                                    className="animate-spin"
                                />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="border border-dashed border-gray-300 rounded-2xl py-24 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                    <Search size={25} />
                                </div>

                                <h2 className="font-bold text-xl mt-5">
                                    No products found
                                </h2>

                                <p className="text-gray-500 text-sm mt-2">
                                    Try changing your search or
                                    filters.
                                </p>

                                <button
                                    onClick={clearFilters}
                                    className="mt-6 bg-black text-white px-5 py-3 rounded-xl text-sm font-semibold"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {products.map(
                                        (product) => (
                                            <ProductCard
                                                key={
                                                    product._id
                                                }
                                                product={
                                                    product
                                                }
                                            />
                                        )
                                    )}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages >
                                    1 && (
                                    <div className="flex items-center justify-center gap-2 mt-12">
                                        <button
                                            disabled={
                                                page === 1
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    page - 1
                                                )
                                            }
                                            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>

                                        {Array.from(
                                            {
                                                length: pagination.totalPages
                                            },
                                            (_, index) =>
                                                index + 1
                                        )
                                            .slice(
                                                Math.max(
                                                    0,
                                                    page - 3
                                                ),
                                                Math.min(
                                                    pagination.totalPages,
                                                    page + 2
                                                )
                                            )
                                            .map(
                                                (
                                                    pageNumber
                                                ) => (
                                                    <button
                                                        key={
                                                            pageNumber
                                                        }
                                                        onClick={() =>
                                                            handlePageChange(
                                                                pageNumber
                                                            )
                                                        }
                                                        className={`w-10 h-10 rounded-xl text-sm font-semibold ${
                                                            page ===
                                                            pageNumber
                                                                ? "bg-black text-white"
                                                                : "border border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        {
                                                            pageNumber
                                                        }
                                                    </button>
                                                )
                                            )}

                                        <button
                                            disabled={
                                                page ===
                                                pagination.totalPages
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    page + 1
                                                )
                                            }
                                            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {mobileFilter && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() =>
                            setMobileFilter(false)
                        }
                    />

                    <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white p-5 overflow-y-auto">
                        <div className="flex items-center justify-between mb-7">
                            <h2 className="text-xl font-bold">
                                Filters
                            </h2>

                            <button
                                onClick={() =>
                                    setMobileFilter(false)
                                }
                                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Search */}
                        <form
                            onSubmit={(e) => {
                                handleSearch(e);
                                setMobileFilter(false);
                            }}
                            className="mb-8"
                        >
                            <label className="text-sm font-semibold">
                                Search
                            </label>

                            <div className="relative mt-2">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search products"
                                    className="w-full h-11 border border-gray-300 rounded-xl pl-9 pr-3 outline-none focus:border-black text-sm"
                                />
                            </div>
                        </form>

                        <h3 className="text-sm font-semibold mb-3">
                            Categories
                        </h3>

                        <div className="space-y-1">
                            <button
                                onClick={() =>
                                    handleCategory("")
                                }
                                className={`w-full text-left px-3 py-3 rounded-lg text-sm ${
                                    !category
                                        ? "bg-black text-white"
                                        : "hover:bg-gray-100"
                                }`}
                            >
                                All Categories
                            </button>

                            {categories.map((item) => (
                                <button
                                    key={item._id}
                                    onClick={() =>
                                        handleCategory(
                                            item._id
                                        )
                                    }
                                    className={`w-full text-left px-3 py-3 rounded-lg text-sm ${
                                        category === item._id
                                            ? "bg-black text-white"
                                            : "hover:bg-gray-100"
                                    }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                clearFilters();
                                setMobileFilter(false);
                            }}
                            className="w-full mt-8 border border-gray-300 py-3 rounded-xl text-sm font-semibold"
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Shop;