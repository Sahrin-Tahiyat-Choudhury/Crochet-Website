const mongoose = require("mongoose");
const productModel = require("./product.model");


const cartSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    items:[
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product"
            },
            quantity:Number
        }
    ],
    totalPrice:Number
})

const cartModel = mongoose.model("cart", cartSchema)

module.exports = cartModel