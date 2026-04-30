const couponModel = require('../models/coupon.model');

function createCouponError(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

async function getCouponDiscount({ code, totalAmount }) {
    if (!code) {
        return {
            coupon: null,
            discountAmount: 0,
            finalAmount: totalAmount
        };
    }

    const coupon = await couponModel.findOne({
        code: code.trim().toUpperCase()
    });

    if (!coupon || !coupon.isActive) {
        throw createCouponError('Invalid coupon');
    }

    if (coupon.expiryDate < new Date()) {
        throw createCouponError('Coupon expired');
    }

    if (totalAmount < coupon.minOrderAmount) {
        throw createCouponError('Minimum order amount not met');
    }

    
    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
        discountAmount = (totalAmount * coupon.value) / 100;
    } else if (coupon.discountType === 'fixed') {
        discountAmount = coupon.value;
    } else {
        throw new Error('Invalid discount type');

    }

    return {
        coupon,
        discountAmount,
        finalAmount: Math.max(0, totalAmount - discountAmount)
    };
}

module.exports = { getCouponDiscount };
