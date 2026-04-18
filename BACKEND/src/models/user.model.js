const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    address:{
        street:String,
        city:String,
        state:String,
        zip:String
    },
    phonenumber:String,
    password:String,
    role:{
        type:String,
        default:"user"
    }
})

const userModel = mongoose.model("user", userSchema)

module.exports = userModel