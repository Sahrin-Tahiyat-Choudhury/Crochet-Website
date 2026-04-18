const express = require('express');
const router = express.Router()
const cartModel = require("../models/cart.model")
const productModel = require("../models/product.model")

router.post("/", async(req,res)=>{
    const {productId, quantity, userId, userEmail} = req.body
    const product = await productModel.findById(productId) // Check if product exists
    if(!product){
        return res.status(404).json({
            message:"Product not found"
        })
    }

    const cart = await cartModel.create({
        productId,
        quantity,
        userId,
        userEmail
    })
    res.status(201).json(cart)
}) 

router.put("/:id", async(req,res)=>{
    const id = req.params.id
    const {quantity} = req.body
    
    if (quantity < 1) {
        return res.status(400).json({
            message: "Quantity must be at least 1"
        })
    }
    await cartModel.findByIdAndUpdate(id, {quantity})
    res.status(200).json({
        message:"Quantity updated"
    })
})

router.delete("/:id", async(req,res)=>{
    const id = req.params.id
    await cartModel.findByIdAndDelete(id)
    res.status(200).json({
        message:"Cart deleted successfully"
    })
})

router.get("/", async(req,res)=>{
    const email = req.query.email
    const cartItems = await cartModel.find({userEmail:email}).populate("productId") //populate to get product details along with cart items

    const updatedCart = await Promise.all(cartItems.map(async (item) => {
      const product = item.productId;

      const totalPrice = product.price * item.quantity;

      return {
        ...item._doc,
        product,
        totalPrice
      };
    })

  );

    const totalAmount = updatedCart.reduce((sum, item) => sum + item.totalPrice, 0);

    res.json({
        items: updatedCart,
        totalAmount
    })
})

module.exports = router;
    