const mongoose = require('mongoose');


const customOrderSchema = new mongoose.Schema({
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            default: null
        },
        productType:{
            type: String,
            enum: ['bouquet','keychain','mini pot','other'],
            required: true
        },
        description: {
            type: String,
            required: true
        },
        colorPreference:{
            type: String,
            default: ""
        },
        quantity:{
            type: Number,
            required: true
        },
        budget: {
            type: Number,
            default: null
        },
        referenceImage:{
            type: String,
            default: null
        },
        name:{
            type: String,
            required: true
        },
        contact:{
            type: String,
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

module.exports = mongoose.model("customOrder", customOrderSchema);
