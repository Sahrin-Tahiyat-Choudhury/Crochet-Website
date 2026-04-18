const mongoose = require("mongoose");
const orderModel = require("./order.model");


const couponSchema = new mongoose.Schema({
    code:String,
    discount:Number,
    expiryDate:Date,
    discountType:{
        type:String,
        enum: ["percentage","fixed"],
        default:"percentage"
    },
    isActive:{
        type:Boolean,
        default:true
    },
    orders:[
        {   
            type: mongoose.Schema.Types.ObjectId,
            ref: "order"
        }
    ]
})

const couponModel = mongoose.model("coupon", couponSchema)

module.exports = couponModel