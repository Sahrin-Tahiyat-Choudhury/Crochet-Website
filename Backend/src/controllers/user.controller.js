const userModel = require('../models/user.model');
const validationRules = require('../middlewares/validation.middleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const tokenBlacklistModel = require('../models/blacklist.model');

async function updateProfile(req, res) {
    try {
        const { username, email, phone, city } = req.body;
        
        const updatedUser = await userModel.findByIdAndUpdate(req.user.id, 
        { username, email, phone, city },                 // Fields to update
        { new: true }).select("-password"); // Exclude password from the response
        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
}
async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await userModel.findById(req.user.id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        user.password = hash;
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error changing password", error });
    }
}

async function uploadPhoto(req, res) {
    try {
        if (!req.body.photo) {
            return res.status(400).json({ message: "No photo provided" });
        }

        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            { photo: req.body.photo },
            { new: true }
        ).select("-password");

        res.status(200).json({
            message: "Photo updated successfully",
            user
        });
    } catch (error) {
        res.status(500).json({ message: "Error uploading photo", error });
    }
}

module.exports = { updateProfile, changePassword, uploadPhoto };

