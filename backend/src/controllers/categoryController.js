import Category from "../models/Category.js";
import createSlug from "../utils/createSlug.js";


// ==========================================
// CREATE CATEGORY
// ==========================================

export const createCategory = async (req, res) => {
    try {
        const {
            name,
            description,
            image
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const slug = createSlug(name);

        const existingCategory = await Category.findOne({
            $or: [
                {
                    name: {
                        $regex: `^${name.trim()}$`,
                        $options: "i"
                    }
                },
                {
                    slug
                }
            ]
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        const category = await Category.create({
            name: name.trim(),
            slug,
            description: description || "",
            image: image || "",
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });

    } catch (error) {
        console.error("Create Category Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating category"
        });
    }
};

export const createMultipleCategories = async (req, res) => {
    try {
        const { categories } = req.body;

        if (!Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Categories array is required"
            });
        }

        const createdCategories = [];
        const skippedCategories = [];

        for (const category of categories) {
            if (!category.name) {
                skippedCategories.push({
                    data: category,
                    reason: "Category name is required"
                });
                continue;
            }

            const slug =
                category.slug || createSlug(category.name);

            const existingCategory = await Category.findOne({
                $or: [
                    { name: category.name },
                    { slug }
                ]
            });

            if (existingCategory) {
                skippedCategories.push({
                    name: category.name,
                    reason: "Category already exists"
                });
                continue;
            }

            const newCategory = await Category.create({
                name: category.name,
                slug,
                description: category.description || "",
                image: category.image || "",
                isActive: category.isActive !== false,
                createdBy: req.user._id
            });

            createdCategories.push(newCategory);
        }

        return res.status(201).json({
            success: true,
            message: "Categories created successfully",
            createdCount: createdCategories.length,
            skippedCount: skippedCategories.length,
            createdCategories,
            skippedCategories
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create multiple categories",
            error: error.message
        });
    }
};

// ==========================================
// GET ALL CATEGORIES
// ==========================================

export const getCategories = async (req, res) => {
    try {
        const {
            search = "",
            includeInactive = "false"
        } = req.query;

        const query = {};

        // Normally only active categories
        if (includeInactive !== "true") {
            query.isActive = true;
        }

        // Search
        if (search.trim()) {
            query.$or = [
                {
                    name: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                }
            ];
        }

        const categories = await Category.find(query)
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        console.error("Get Categories Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching categories"
        });
    }
};


// ==========================================
// GET SINGLE CATEGORY BY ID
// ==========================================

export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            isActive: true
        }).populate("createdBy", "name email");

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            category
        });

    } catch (error) {
        console.error("Get Category Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching category"
        });
    }
};


// ==========================================
// GET CATEGORY BY SLUG
// ==========================================

export const getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findOne({
            slug: req.params.slug,
            isActive: true
        }).populate("createdBy", "name email");

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            category
        });

    } catch (error) {
        console.error("Get Category By Slug Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching category"
        });
    }
};


// ==========================================
// UPDATE CATEGORY
// ==========================================

export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const {
            name,
            description,
            image,
            isActive
        } = req.body;


        // ------------------------------
        // Name change
        // ------------------------------

        if (name !== undefined) {
            const trimmedName = name.trim();

            if (!trimmedName) {
                return res.status(400).json({
                    success: false,
                    message: "Category name cannot be empty"
                });
            }

            const newSlug = createSlug(trimmedName);

            const existingCategory = await Category.findOne({
                _id: {
                    $ne: category._id
                },
                $or: [
                    {
                        name: {
                            $regex: `^${trimmedName}$`,
                            $options: "i"
                        }
                    },
                    {
                        slug: newSlug
                    }
                ]
            });

            if (existingCategory) {
                return res.status(409).json({
                    success: false,
                    message: "Another category with this name already exists"
                });
            }

            category.name = trimmedName;
            category.slug = newSlug;
        }


        // ------------------------------
        // Other fields
        // ------------------------------

        if (description !== undefined) {
            category.description = description;
        }

        if (image !== undefined) {
            category.image = image;
        }

        if (isActive !== undefined) {
            category.isActive = isActive;
        }

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });

    } catch (error) {
        console.error("Update Category Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating category"
        });
    }
};


// ==========================================
// DELETE CATEGORY
// ==========================================

export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Soft delete
        category.isActive = false;

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error("Delete Category Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting category"
        });
    }
};