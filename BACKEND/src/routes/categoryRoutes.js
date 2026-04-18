const express = require('express');
const router = express.Router()
const categoryModel = require("../models/category.model")

//Create category
router.post("/",async(req,res)=> {
    const data = req.body
    const category = await categoryModel.create({
        name:data.name,
        image:data.images,
        isVisible:data.isVisible,
        order:data.order

})
    res.status(201).json(category)
})

//Edit category
router.put("/:id", async(req,res)=>{
    const id = req.params.id
    const data = req.body
    await categoryModel.findByIdAndUpdate(id, data)
    res.status(200).json({
        message:"Category updated successfully"
    })
})
//Delete category
router.delete("/:id", async(req,res)=>{
        const id = req.params.id    
    await categoryModel.findByIdAndDelete({
        _id:id
    })
    res.status(200).json({
        message:"Category deleted successfully"
    })
})  

//Get all categories
router.get("/", async(req,res)=>{
    const categories = await categoryModel.find({isVisible: true}).sort({order:1}) //isVisible filter to show only visible categories and sort by order
    res.json(categories)
})

//hide category
router.put("/:id/hide", async(req,res)=>{
    await categoryModel.findByIdAndUpdate(req.params.id, {
        isVisible: false
    })  
    res.json({
        message:"Category hidden successfully"
    })
})

//show category
router.put("/:id/show", async(req,res)=>{
    await categoryModel.findByIdAndUpdate(req.params.id, {
        isVisible: true
    })  
    res.json({
        message:"Category shown successfully"
    })
})


module.exports = router;