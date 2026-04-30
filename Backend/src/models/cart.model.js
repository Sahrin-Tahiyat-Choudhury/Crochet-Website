const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    items: [
        {
            productId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'product',
                        required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            }
        }
    ],
    couponCode: {
        type: String,
        default: null
    }

}, { timestamps: true })
const cartModel = mongoose.model('cart', cartSchema);

module.exports = cartModel;
