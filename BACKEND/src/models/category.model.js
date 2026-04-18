const mongoose = require("mongoose");
const { link } = require("../routes/productRoutes");

const categorySchema = new mongoose.Schema({
    name: String,
    image: [String],
    isVisible: {
        type: Boolean, 
        default: true
    },
    order: { 
        type: Number,
        default: 0
     } // for sorting categories
})

const categoryModel = mongoose.model("Category", categorySchema)

module.exports = categoryModel