const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
   userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
   },
    items:[
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product"
        },
            name: String,
            quantity: Number,
            price: Number
        }
    ],
    totalPrice:Number,
    coupon:{
        code: String,
        discount: Number,
        discountType: String
    },
    totalAfterDiscount:Number,
    status:{
        type:String,
            enum: ["pending","approved", "cancelled","awaiting_payment","paid", "shipped","delivered"],
        default:"pending"
    },
    paymentStatus: {
        type:String,
        enum: ["pending","paid"],
        default:"pending"
    },
    shippingAddress:{
        street:String,
        city:String,
        state:String,
        zip:String
    },

},{timestamps:true}); // automatically adds createdAt and updatedAt, no need to define manually

const orderModel = mongoose.model("order", orderSchema)

module.exports = orderModel