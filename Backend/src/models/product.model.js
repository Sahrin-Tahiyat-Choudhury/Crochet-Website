const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    uri:{
        type: String,
        required: false,
        default: "",  // ← changed this
    
    },
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        default: "",
    },
    type: {
        type: String,
        enum: ["flower", "wrapper", "other"],
        default: "other"
    },
    colors: [{ 
        type: String  // ["red", "pink", "white"]
     }],   
    material:{
        type: String,
        default: "",
    },
    careInstructions:{
        type: String,
        default: "",
    },
    stockQuantity:{
        type: Number,
        default: 0,
    },
    lowStockAlertAt: {
        type: Number,
        default: 3
    },
    sold: {
        type: Number,
        default: 0,
    },
    price:{
        originalPrice:{
            type: Number,
            required: true,
        },
        sellingPrice:{
            type: Number,
            required: true,
        }
    },
    isFeatured:{
        type: Boolean,
        default: false
    },
    isHidden:{
        type: Boolean,
        default: false
    },
    isDraft:{
        type:Boolean,
        default:false
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"category",
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: true,
    }
}, { timestamps: true })

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;