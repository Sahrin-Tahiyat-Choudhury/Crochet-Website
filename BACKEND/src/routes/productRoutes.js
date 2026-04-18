const express = require('express');
const router = express.Router()
const productModel = require("../models/product.model")

//adding a product
router.post("/", async(req,res)=>{
    const data = req.body
    const product = await productModel.create({
        name:data.name,
        price:data.price,
        description:data.description,
        category:data.category,
        image:data.images
    })
    res.status(201).json(product)
})
//deleting a product
router.delete("/:id", async(req,res)=>{
     const id = req.params.id
    await productModel.findByIdAndDelete({
        _id:id
    })
    res.status(200).json({
        message:"Product deleted successfully"
    })
})

//editing a product
router.put("/:id", async(req,res)=>{
    const id = req.params.id
    const data = req.body
    await productModel.findByIdAndUpdate(id, data)
    res.status(200).json({
        message:"Product updated successfully"
    })
})

//getting all products
router.get("/", async(req,res)=>{
    const {minPrice, maxPrice, sort,search,category} = req.query;

    let filter = {};

    //filters products by price range
    if(minPrice && maxPrice){
        filter.price = {$gte: Number(minPrice), $lte: Number(maxPrice)}
    }

    //filters products by category
    if(category){
        filter.category = category
    }

    //searches products by name
    if(search){
        filter.name = {$regex: search, $options:"i"}
    }

    //filters out hidden products
    filter.isVisible = true

    //sorts products by price, name, date, featured or best selling
    let sortOption = {};
    if(sort === "price_asc"){
        sortOption.price = 1
    }else if(sort === "price_desc"){
        sortOption.price = -1
    }else if(sort === "name_asc"){
        sortOption.name = 1
    }else if(sort === "name_desc"){
        sortOption.name = -1
    }else if(sort === "date_asc"){
        sortOption.createdAt = 1
    }else if(sort === "date_desc"){
        sortOption.createdAt = -1
    }else if(sort === "featured"){
        sortOption.featured = -1
    }else if(sort === "best_selling"){
        sortOption.sold = -1
    }

    const products = await productModel.find(filter).populate("category").sort(sortOption)

    //discounted price calculation
       const productsWithDiscount = products.map(product => {
        const discount = ((product.mrp - product.price) / product.mrp * 100)  // discount percentage
        return {
            ...product._doc,
            discount: Math.round(discount),
            availability: product.quantity > 0 ? "In Stock" : "Out of Stock"
        }
    })  
    res.json(productsWithDiscount);
})

//getting featured products 
router.get("/featured", async(req,res)=>{
    const featuredProducts = await productModel.find({
        featured: true
    })
    res.json(featuredProducts)
})

//getting a product by id
router.get("/:id", async(req,res)=>{
    const product = await productModel.findById(req.params.id).populate("category") //.populate to get category details along with product
    if(product){
        res.json(product);
    }else{
        res.status(404).json({
            message:"Product not found"
        })
    } 
})

//marks a product as featured
router.put("/:id/featured", async(req,res)=>{
    await productModel.findByIdAndUpdate(req.params.id, {
        featured: true,
        isVisible: true  // ensures featured products are visible
    })
    res.json({
        message:"Product marked as featured"
    })
})

//hides a product
router.put("/:id/hide", async(req,res)=>{
    await productModel.findByIdAndUpdate(req.params.id, {
        isVisible: false
    })
    res.json({
        message:"Product hidden successfully"
    })
})

//shows a product
router.put("/:id/show", async(req,res)=>{
    await productModel.findByIdAndUpdate(req.params.id, {
        isVisible: true
    })
    res.json({
        message:"Product is visible"
    })
})

//code for review
router.post("/:id/review", async(req,res)=>{
    const {userId, rating, comment} = req.body
    const product = await productModel.findById(req.params.id)
    if(!product){
        return res.status(404).json({
            message:"Product not found"
        })
    }
    //adds new review
    product.reviews.push({userId, rating, comment})

    //update average rating after adding new review
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0) 
    product.rating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

    await product.save()
    res.json({
        message:"Review added successfully"
    })
})

module.exports = router;