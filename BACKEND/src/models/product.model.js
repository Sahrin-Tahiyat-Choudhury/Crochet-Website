const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    name:String,
    variants:[
        {
            color: String,
             size: String,
             quantity: Number
        }
    ],
    description:String,
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true  //mandatory field to link product to a category
    },
    images:[String],
    mrp:Number,
    price:Number,
    quantity:Number,
    shippingDetails:String,
    rating:Number,
    reviews:[{
        userId:mongoose.Schema.Types.ObjectId,
        rating:Number,
        comment:String
    }],
    materialCareInstructions:String,
    createdAt: {
    type: Date,
    default: Date.now
    },
    sold: {
        type: Number,
        default: 0   // for best selling
    },
    featured: {
        type: Boolean,
        default: false  // for featured products
    },
    isVisible: {
        type: Boolean,
        default: true
    }
})

const productModel = mongoose.model("product", productSchema)

module.exports = productModel