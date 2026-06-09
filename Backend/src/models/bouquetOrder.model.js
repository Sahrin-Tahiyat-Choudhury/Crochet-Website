const mongoose = require('mongoose');

const bouquetOrderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    flowers:[{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        color: {
            type: String,
            default: ''
        }
    }],
    wrapper:{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
        color: {
            type: String,
            default: ""
        }

    },
    totalPrice:{
        type: Number,
        required: true
    },
    status:{
        type:String,
        enum: ["pending", "confirmed", "rejected"],
        default: "pending"
    },
    adminReply:{
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("bouquetOrder", bouquetOrderSchema);
