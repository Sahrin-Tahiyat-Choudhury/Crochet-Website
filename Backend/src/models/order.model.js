const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    
    discountAmount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'coupon',
        default: null
    },
    couponCode: {
        type: String,
        default: null
    },
    address: {
        fullName: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentStatus: {
        type: String,
        // Payment done only after admin approves the order, so we can set it to pending by default and update it after approval
        enum: ['pending', 'paid'],
        default: 'pending'

    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'approved'],
        default: 'pending'
    },
    refundStatus: {
        type: String,
        enum: ['none', 'requested', 'approved', 'rejected', 'refunded'],
        default: 'none'
    },
    refundReason: {
        type: String,
        default: null
    },
    utrNumber: {
        type: String, 
        default: null 
    },
    razorpayOrderId: { 
        type: String, 
        default: null 
    },
    razorpayPaymentId: { 
        type: String, 
        default: null 
    },
}, {timestamps: true});

const orderModel = mongoose.model('order', orderSchema);

module.exports = orderModel;
