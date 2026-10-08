import Product from "../models/Product.js";
import Category from "../models/Category.js";
import createSlug from "../utils/createSlug.js";


// ==========================================
// CREATE PRODUCT
// ==========================================

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            shortDescription,
            description,
            price,
            discountPrice,
            category,
            brand,
            sku,
            images,
            stock,
            featured
        } = req.body;


        // -----------------------------
        // Required fields
        // -----------------------------

        if (
            !name ||
            !description ||
            price === undefined ||
            !category ||
            !sku ||
            stock === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, description, price, category, SKU and stock are required"
            });
        }


        // -----------------------------
        // Check category
        // -----------------------------

        const categoryExists = await Category.findOne({
            _id: category,
            isActive: true
        });

        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Active category not found"
            });
        }


        // -----------------------------
        // Create slug
        // -----------------------------

        const slug = createSlug(name);


        // -----------------------------
        // Check duplicate slug
        // -----------------------------

        const existingSlug = await Product.findOne({
            slug
        });

        if (existingSlug) {
            return res.status(409).json({
                success: false,
                message: "A product with this name already exists"
            });
        }


        // -----------------------------
        // Check SKU
        // -----------------------------

        const existingSku = await Product.findOne({
            sku: sku.trim().toUpperCase()
        });

        if (existingSku) {
            return res.status(409).json({
                success: false,
                message: "SKU already exists"
            });
        }


        // -----------------------------
        // Validate discount
        // -----------------------------

        if (
            discountPrice !== undefined &&
            discountPrice !== null &&
            Number(discountPrice) >= Number(price)
        ) {
            return res.status(400).json({
                success: false,
                message: "Discount price must be less than original price"
            });
        }


        // -----------------------------
        // Create product
        // -----------------------------

        const product = await Product.create({
            name: name.trim(),
            slug,

            shortDescription:
                shortDescription?.trim() || "",

            description: description.trim(),

            price: Number(price),

            discountPrice:
                discountPrice !== undefined &&
                discountPrice !== null
                    ? Number(discountPrice)
                    : null,

            category,

            brand: brand?.trim() || "",

            sku: sku.trim().toUpperCase(),

            images: Array.isArray(images) ? images : [],

            stock: Number(stock),

            featured: featured === true,

            createdBy: req.user._id
        });


        const populatedProduct = await Product.findById(product._id)
            .populate("category", "name slug image")
            .populate("createdBy", "name email");


        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: populatedProduct
        });

    } catch (error) {
        console.error("Create Product Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating product"
        });
    }
};


// ==========================================
// CREATE MULTIPLE PRODUCTS
// ==========================================

export const createMultipleProducts = async (req, res) => {
    try {
        const { products } = req.body;

        // ------------------------------------------
        // Validate products array
        // ------------------------------------------

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Products array is required"
            });
        }

        const createdProducts = [];
        const skippedProducts = [];

        // Used to prevent duplicate data
        // inside the same request
        const usedSlugs = new Set();
        const usedSkus = new Set();

        // ------------------------------------------
        // Loop products
        // ------------------------------------------

        for (const product of products) {
            try {
                // ------------------------------------------
                // Required fields
                // ------------------------------------------

                if (
                    !product.name ||
                    !product.description ||
                    product.price === undefined ||
                    !product.category ||
                    !product.sku ||
                    product.stock === undefined
                ) {
                    skippedProducts.push({
                        name: product.name || "Unknown",
                        reason:
                            "Name, description, price, category, SKU and stock are required"
                    });

                    continue;
                }

                // ------------------------------------------
                // Price validation
                // ------------------------------------------

                const price = Number(product.price);
                const stock = Number(product.stock);

                if (Number.isNaN(price) || price < 0) {
                    skippedProducts.push({
                        name: product.name,
                        reason: "Invalid price"
                    });

                    continue;
                }

                if (Number.isNaN(stock) || stock < 0) {
                    skippedProducts.push({
                        name: product.name,
                        reason: "Invalid stock"
                    });

                    continue;
                }

                // ------------------------------------------
                // Find Category
                // ------------------------------------------

                let category = null;

                const categoryValue =
                    String(product.category).trim();

                // Check ObjectId only if valid ObjectId
                if (/^[0-9a-fA-F]{24}$/.test(categoryValue)) {
                    category = await Category.findOne({
                        _id: categoryValue,
                        isActive: true
                    });
                }

                // If not ObjectId, search by slug
                if (!category) {
                    category = await Category.findOne({
                        slug: categoryValue.toLowerCase(),
                        isActive: true
                    });
                }

                // If not found, search by name
                if (!category) {
                    category = await Category.findOne({
                        name: categoryValue,
                        isActive: true
                    });
                }

                if (!category) {
                    skippedProducts.push({
                        name: product.name,
                        category: product.category,
                        reason:
                            "Active category not found"
                    });

                    continue;
                }

                // ------------------------------------------
                // Create / normalize slug
                // ------------------------------------------

                const slug =
                    product.slug?.trim() ||
                    createSlug(product.name);

                // ------------------------------------------
                // Check duplicate slug
                // ------------------------------------------

                if (usedSlugs.has(slug)) {
                    skippedProducts.push({
                        name: product.name,
                        reason:
                            "Duplicate product slug in this request"
                    });

                    continue;
                }

                const existingSlug =
                    await Product.findOne({ slug });

                if (existingSlug) {
                    skippedProducts.push({
                        name: product.name,
                        reason:
                            "Product with this slug already exists"
                    });

                    continue;
                }

                // ------------------------------------------
                // Format SKU
                // ------------------------------------------

                const sku =
                    String(product.sku)
                        .trim()
                        .toUpperCase();

                // ------------------------------------------
                // Check duplicate SKU
                // ------------------------------------------

                if (usedSkus.has(sku)) {
                    skippedProducts.push({
                        name: product.name,
                        reason:
                            "Duplicate SKU in this request"
                    });

                    continue;
                }

                const existingSku =
                    await Product.findOne({ sku });

                if (existingSku) {
                    skippedProducts.push({
                        name: product.name,
                        reason:
                            "SKU already exists"
                    });

                    continue;
                }

                // ------------------------------------------
                // Discount price
                // ------------------------------------------

                let discountPrice = null;

                if (
                    product.discountPrice !== undefined &&
                    product.discountPrice !== null &&
                    product.discountPrice !== ""
                ) {
                    discountPrice =
                        Number(product.discountPrice);

                    if (
                        Number.isNaN(discountPrice) ||
                        discountPrice < 0
                    ) {
                        skippedProducts.push({
                            name: product.name,
                            reason:
                                "Invalid discount price"
                        });

                        continue;
                    }

                    if (discountPrice >= price) {
                        skippedProducts.push({
                            name: product.name,
                            reason:
                                "Discount price must be less than original price"
                        });

                        continue;
                    }
                }

                // ------------------------------------------
                // Create Product
                // ------------------------------------------

                const newProduct = await Product.create({
                    name: product.name.trim(),

                    slug,

                    shortDescription:
                        product.shortDescription?.trim() || "",

                    description:
                        product.description.trim(),

                    price,

                    discountPrice,

                    category: category._id,

                    brand:
                        product.brand?.trim() || "",

                    sku,

                    images:
                        Array.isArray(product.images)
                            ? product.images
                            : [],

                    stock,

                    soldCount:
                        Number(product.soldCount || 0),

                    rating:
                        Number(product.rating || 0),

                    numReviews:
                        Number(product.numReviews || 0),

                    featured:
                        product.featured === true,

                    isActive:
                        product.isActive !== false,

                    createdBy:
                        req.user._id
                });

                // Mark as used in current request
                usedSlugs.add(slug);
                usedSkus.add(sku);

                createdProducts.push(newProduct);

            } catch (itemError) {

                console.error(
                    "Bulk Product Item Error:",
                    itemError
                );

                skippedProducts.push({
                    name: product?.name || "Unknown",
                    reason: itemError.message
                });
            }
        }

        // ------------------------------------------
        // Response
        // ------------------------------------------

        return res.status(201).json({
            success: true,

            message:
                "Bulk product upload completed",

            totalReceived:
                products.length,

            createdCount:
                createdProducts.length,

            skippedCount:
                skippedProducts.length,

            createdProducts,

            skippedProducts
        });

    } catch (error) {
        console.error(
            "Create Multiple Products Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while creating multiple products",
            error: error.message
        });
    }
};

// ==========================================
// GET ALL PRODUCTS
// ==========================================

export const getProducts = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 12,
            search = "",
            category,
            brand,
            minPrice,
            maxPrice,
            featured,
            sort = "latest"
        } = req.query;


        page = Math.max(Number(page), 1);
        limit = Math.min(Math.max(Number(limit), 1), 100);

        const skip = (page - 1) * limit;


        // -----------------------------
        // Base query
        // -----------------------------

        const query = {
            isActive: true
        };


        // -----------------------------
        // Search
        // -----------------------------

        if (search.trim()) {
            query.$or = [
                {
                    name: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                },
                {
                    brand: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                },
                {
                    sku: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                }
            ];
        }


        // -----------------------------
        // Category
        // -----------------------------

        if (category) {
            query.category = category;
        }


        // -----------------------------
        // Brand
        // -----------------------------

        if (brand) {
            query.brand = {
                $regex: `^${brand}$`,
                $options: "i"
            };
        }


        // -----------------------------
        // Price
        // -----------------------------

        if (
            minPrice !== undefined ||
            maxPrice !== undefined
        ) {
            query.price = {};

            if (minPrice !== undefined) {
                query.price.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                query.price.$lte = Number(maxPrice);
            }
        }


        // -----------------------------
        // Featured
        // -----------------------------

        if (featured !== undefined) {
            query.featured = featured === "true";
        }


        // -----------------------------
        // Sorting
        // -----------------------------

        let sortOption = {
            createdAt: -1
        };

        if (sort === "price-low") {
            sortOption = {
                price: 1
            };
        }

        if (sort === "price-high") {
            sortOption = {
                price: -1
            };
        }

        if (sort === "popular") {
            sortOption = {
                soldCount: -1
            };
        }

        if (sort === "rating") {
            sortOption = {
                rating: -1
            };
        }


        // -----------------------------
        // Get products
        // -----------------------------

        const [products, totalProducts] = await Promise.all([
            Product.find(query)
                .populate("category", "name slug image")
                .sort(sortOption)
                .skip(skip)
                .limit(limit),

            Product.countDocuments(query)
        ]);


        const totalPages = Math.ceil(
            totalProducts / limit
        );


        res.status(200).json({
            success: true,

            products,

            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (error) {
        console.error("Get Products Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching products"
        });
    }
};


// ==========================================
// GET PRODUCT BY ID
// ==========================================

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            isActive: true
        })
            .populate("category", "name slug image")
            .populate("createdBy", "name email");


        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Get Product Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching product"
        });
    }
};


// ==========================================
// GET PRODUCT BY SLUG
// ==========================================

export const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({
            slug: req.params.slug,
            isActive: true
        })
            .populate("category", "name slug image")
            .populate("createdBy", "name email");


        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Get Product By Slug Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching product"
        });
    }
};


// ==========================================
// UPDATE PRODUCT
// ==========================================

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        const {
            name,
            shortDescription,
            description,
            price,
            discountPrice,
            category,
            brand,
            sku,
            images,
            stock,
            featured,
            isActive
        } = req.body;


        // -----------------------------
        // Category validation
        // -----------------------------

        if (category !== undefined) {
            const categoryExists = await Category.findOne({
                _id: category,
                isActive: true
            });

            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: "Active category not found"
                });
            }

            product.category = category;
        }


        // -----------------------------
        // Name + slug
        // -----------------------------

        if (name !== undefined) {
            const newSlug = createSlug(name);

            const duplicateProduct =
                await Product.findOne({
                    slug: newSlug,
                    _id: {
                        $ne: product._id
                    }
                });

            if (duplicateProduct) {
                return res.status(409).json({
                    success: false,
                    message: "Another product with this name already exists"
                });
            }

            product.name = name.trim();
            product.slug = newSlug;
        }


        // -----------------------------
        // Basic fields
        // -----------------------------

        if (shortDescription !== undefined) {
            product.shortDescription =
                shortDescription.trim();
        }

        if (description !== undefined) {
            product.description =
                description.trim();
        }

        if (brand !== undefined) {
            product.brand = brand.trim();
        }

        if (images !== undefined) {
            product.images = Array.isArray(images)
                ? images
                : [];
        }

        if (stock !== undefined) {
            product.stock = Number(stock);
        }

        if (featured !== undefined) {
            product.featured = featured;
        }

        if (isActive !== undefined) {
            product.isActive = isActive;
        }


        // -----------------------------
        // Price
        // -----------------------------

        const finalPrice =
            price !== undefined
                ? Number(price)
                : product.price;

        const finalDiscount =
            discountPrice !== undefined
                ? discountPrice === null
                    ? null
                    : Number(discountPrice)
                : product.discountPrice;


        if (
            finalDiscount !== null &&
            finalDiscount >= finalPrice
        ) {
            return res.status(400).json({
                success: false,
                message: "Discount price must be less than original price"
            });
        }


        if (price !== undefined) {
            product.price = Number(price);
        }

        if (discountPrice !== undefined) {
            product.discountPrice = finalDiscount;
        }


        // -----------------------------
        // SKU
        // -----------------------------

        if (sku !== undefined) {
            const formattedSku =
                sku.trim().toUpperCase();

            const duplicateSku =
                await Product.findOne({
                    sku: formattedSku,
                    _id: {
                        $ne: product._id
                    }
                });

            if (duplicateSku) {
                return res.status(409).json({
                    success: false,
                    message: "SKU already exists"
                });
            }

            product.sku = formattedSku;
        }


        await product.save();


        const updatedProduct =
            await Product.findById(product._id)
                .populate(
                    "category",
                    "name slug image"
                )
                .populate(
                    "createdBy",
                    "name email"
                );


        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error("Update Product Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating product"
        });
    }
};


// ==========================================
// DELETE PRODUCT
// ==========================================

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        product.isActive = false;

        await product.save();


        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete Product Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting product"
        });
    }
};