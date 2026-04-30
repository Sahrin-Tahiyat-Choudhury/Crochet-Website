const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },  
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"product",
    }],
    isHidden:{
        type: Boolean,
        default: false,
    },
    order: {
        type: Number,
        default: 0,
        ascending: true, 
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: true,
    }
})

const categoryModel = mongoose.model("category", categorySchema);

module.exports = categoryModel;