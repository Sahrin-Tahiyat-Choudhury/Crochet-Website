const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true, 
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    phone: { type: String, default: "" },
    city: { type: String, default: "" },
    photo: { type: String, default: "" }
})

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;