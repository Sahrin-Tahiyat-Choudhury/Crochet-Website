const express = require('express');
const router = express.Router()
const userModel = require("../models/user.model")

// Register a new user
router.post("/register", async(req,res)=>{
    const data = req.body
    const user = await userModel.create({
        name:data.name,
        email:data.email,
        phonenumber:data.phonenumber,
        address:data.address,
        password:data.password
    })
    res.status(201).json({
        message:"User registered successfully"
    })
})

// Login a user
router.post("/login", async(req,res)=>{
    const data = req.body
    const user = await userModel.findOne({
        email:data.email,
        phonenumber:data.phonenumber,
        password:data.password
    })
    if(user){
        res.status(200).json({
        message:"User logged in successfully",
        role: user.role 
    })
    }else{
        res.status(400).json({
            message:"Invalid credentials"
        })
    }
})

//view user profile (admin only)
router.get("/profile", async(req,res)=>{
    const email = req.query.email
    const user = await userModel.findOne({email:email})
    if(user){
        res.json(user);
    }else{
        res.status(404).json({
            message:"User not found"
        })
    }
})
    
//view all users (admin only)
router.get("/all", async(req,res)=>{
    const users = await userModel.find()
    res.json(users);
})  

//view own profile (user only)
router.get("/me", async(req,res)=>{
    try {
    const email = req.query.email
    if(!email){
        return res.status(400).json({
            message:"Email is required"
        })
    }
    const user = await userModel.findOne({email:email}).select("-password")
    if(user){
        res.json(user);
    }else{  
        res.status(404).json({
            message:"User not found"
        })
    }   
    } catch (error) {
        res.status(500).json({
            message:"Server error",
            error:error.message
        })
    }
})

//update user profile (user only)
router.put("/update", async(req,res)=>{
    try{
    const email = req.query.email
    if(!email){
        return res.status(400).json({
            message:"Email is required"
        })
    }
    const {name,phonenumber,address} = req.body;
    const allowedUpdates = {name,phonenumber,address}
    const user = await userModel.findOneAndUpdate({email:email}, allowedUpdates, {new:true}).select("-password");

    if(user){
        res.json({
            message:"User profile updated successfully",
            user:user
        });
    }else{
        res.status(404).json({
            message:"User not found"
        })
    }
    }catch(error){
        res.status(500).json({
            message:"Server error",
            error:error.message
        })
    }
})


module.exports = router;