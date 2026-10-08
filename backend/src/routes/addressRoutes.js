import express from "express";

import {
    addAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    setDefaultAddress,
    deleteAddress
} from "../controllers/addressController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all addresses
router.get("/", protect, getAddresses);

// Get single address
router.get("/:id", protect, getAddressById);

// Add address
router.post("/", protect, addAddress);

// Update address
router.put("/:id", protect, updateAddress);

// Set default address
router.patch("/:id/default", protect, setDefaultAddress);

// Delete address
router.delete("/:id", protect, deleteAddress);

export default router;