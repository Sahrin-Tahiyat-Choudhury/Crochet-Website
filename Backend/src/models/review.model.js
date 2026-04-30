const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
    productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    adminResponse: {
        type: String,
        trim: true,
        default: ''
    },
    adminResponseAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

const reviewModel = mongoose.model("review", reviewSchema);

module.exports = reviewModel;