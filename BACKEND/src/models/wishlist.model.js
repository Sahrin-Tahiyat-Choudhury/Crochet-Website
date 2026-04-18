const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
    userEmail: String,
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
    }
})

const wishlistModel = mongoose.model("wishlist", wishlistSchema)

module.exports = wishlistModel