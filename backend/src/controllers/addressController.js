import mongoose from "mongoose";
import Address from "../models/Address.js";

// ==========================================
// ADD ADDRESS
// ==========================================

export const addAddress = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            landmark,
            addressType,
            isDefault
        } = req.body;

        // Required fields
        if (
            !fullName ||
            !phone ||
            !addressLine1 ||
            !city ||
            !state ||
            !postalCode
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Full name, phone, address, city, state and postal code are required"
            });
        }

        // Phone validation
        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10 digit phone number"
            });
        }

        // Postal code validation
        const postalRegex = /^\d{6}$/;

        if (!postalRegex.test(postalCode)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 6 digit postal code"
            });
        }

        // Check user's addresses
        const addressCount = await Address.countDocuments({
            user: req.user._id
        });

        // First address automatically becomes default
        let makeDefault = Boolean(isDefault);

        if (addressCount === 0) {
            makeDefault = true;
        }

        // If new address is default,
        // remove default from old addresses
        if (makeDefault) {
            await Address.updateMany(
                {
                    user: req.user._id
                },
                {
                    $set: {
                        isDefault: false
                    }
                }
            );
        }

        const address = await Address.create({
            user: req.user._id,
            fullName,
            phone,
            addressLine1,
            addressLine2: addressLine2 || "",
            city,
            state,
            postalCode,
            country: country || "India",
            landmark: landmark || "",
            addressType: addressType || "home",
            isDefault: makeDefault
        });

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            address
        });
    } catch (error) {
        console.error("Add Address Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while adding address"
        });
    }
};


// ==========================================
// GET ALL ADDRESSES
// ==========================================

export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({
            user: req.user._id
        }).sort({
            isDefault: -1,
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            count: addresses.length,
            addresses
        });
    } catch (error) {
        console.error("Get Addresses Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching addresses"
        });
    }
};


// ==========================================
// GET SINGLE ADDRESS
// ==========================================

export const getAddressById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID"
            });
        }

        const address = await Address.findOne({
            _id: id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        res.status(200).json({
            success: true,
            address
        });
    } catch (error) {
        console.error("Get Address Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching address"
        });
    }
};


// ==========================================
// UPDATE ADDRESS
// ==========================================

export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID"
            });
        }

        const address = await Address.findOne({
            _id: id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        const {
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            landmark,
            addressType,
            isDefault
        } = req.body;

        // Phone validation if provided
        if (phone) {
            const phoneRegex = /^[6-9]\d{9}$/;

            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid 10 digit phone number"
                });
            }

            address.phone = phone;
        }

        // Postal validation if provided
        if (postalCode) {
            const postalRegex = /^\d{6}$/;

            if (!postalRegex.test(postalCode)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid 6 digit postal code"
                });
            }

            address.postalCode = postalCode;
        }

        if (fullName !== undefined) {
            address.fullName = fullName;
        }

        if (addressLine1 !== undefined) {
            address.addressLine1 = addressLine1;
        }

        if (addressLine2 !== undefined) {
            address.addressLine2 = addressLine2;
        }

        if (city !== undefined) {
            address.city = city;
        }

        if (state !== undefined) {
            address.state = state;
        }

        if (country !== undefined) {
            address.country = country;
        }

        if (landmark !== undefined) {
            address.landmark = landmark;
        }

        if (addressType !== undefined) {
            if (!["home", "work", "other"].includes(addressType)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid address type"
                });
            }

            address.addressType = addressType;
        }

        // Make default
        if (isDefault === true) {
            await Address.updateMany(
                {
                    user: req.user._id,
                    _id: { $ne: id }
                },
                {
                    $set: {
                        isDefault: false
                    }
                }
            );

            address.isDefault = true;
        }

        await address.save();

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address
        });
    } catch (error) {
        console.error("Update Address Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating address"
        });
    }
};


// ==========================================
// SET DEFAULT ADDRESS
// ==========================================

export const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID"
            });
        }

        const address = await Address.findOne({
            _id: id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Remove default from all user's addresses
        await Address.updateMany(
            {
                user: req.user._id
            },
            {
                $set: {
                    isDefault: false
                }
            }
        );

        // Make selected address default
        address.isDefault = true;

        await address.save();

        res.status(200).json({
            success: true,
            message: "Default address updated successfully",
            address
        });
    } catch (error) {
        console.error("Set Default Address Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while setting default address"
        });
    }
};


// ==========================================
// DELETE ADDRESS
// ==========================================

export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID"
            });
        }

        const address = await Address.findOne({
            _id: id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        const wasDefault = address.isDefault;

        await Address.deleteOne({
            _id: id,
            user: req.user._id
        });

        // If deleted address was default,
        // make another address default
        if (wasDefault) {
            const nextAddress = await Address.findOne({
                user: req.user._id
            }).sort({
                createdAt: -1
            });

            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        console.error("Delete Address Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting address"
        });
    }
};