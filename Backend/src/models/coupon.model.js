const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code:{
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    discountType:{
        type: String,
        enum :["percentage","fixed"],
        required: true
    },
    value:{
        type: Number,
        required: true
    },
    minOrderAmount:{
        type: Number,
        default: 0
    },
    isActive:{
        type: Boolean,
        default: true
    },
    expiryDate:{
        type: Date,
        required : true
    }
})

const couponModel = mongoose.model("coupon", couponSchema);

module.exports = couponModel;