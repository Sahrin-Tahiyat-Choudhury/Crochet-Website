const express = require('express');
const router = express.Router()
const orderModel = require("../models/order.model")
const cartModel = require("../models/cart.model")
const couponModel = require("../models/coupon.model")

//place an order
router.post("/place", async(req,res)=>{
    try{
        const {userId, shippingAddress, couponCode} = req.body
        const cart = await cartModel.findOne({user:userId}).populate("items.product")
        if(!cart || cart.items.length === 0){
            return res.status(400).json({message:"Cart is empty"})
        }
        
        //build order items from cart items
        const orderItems = cart.items.map(item=>({
            productId: item.product._id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price
        }));

        let totalPrice = orderItems.reduce((total, item)=> total + item.price * item.quantity, 0)
        let totalAfterDiscount = totalPrice
        let appliedCoupon = null
        if(couponCode){
            const coupon = await couponModel.findOne({code:couponCode, isActive:true})
            if(!coupon){
                return res.status(400).json({message:"Invalid coupon code"})
            }
            if(coupon.expiryDate < new Date()){
                return res.status(400).json({message:"Coupon has expired"})
            }

            //calculate discount
            if(coupon.discountType === "percentage"){
                totalAfterDiscount = totalPrice - (totalPrice * coupon.discount / 100)
            }   
            else{
                totalAfterDiscount = totalPrice - coupon.discount
            }

            appliedCoupon = {
                code: coupon.code,
                discount: coupon.discount,
                discountType: coupon.discountType
            }
        }   

        //create order
        const order = await orderModel.create({
            userId,
            items,
            totalPrice,
            coupon: appliedCoupon,
            totalAfterDiscount,
            shippingAddress,
            status:"pending",
            paymentStatus:"pending"
        })

        //clear cart after placing order 
        await cartModel.findOneAndUpdate({user:userId}, {items:[], totalPrice:0})
        res.status(201).json({
            message:"Order placed successfully",
            orderId: order
        })
    }
    catch(error){
        res.status(500).json({message:"server error"})
    }
})

//view user orders (user only)
router.get("/myorders", async(req,res)=>{
    try{
        const userId = req.query.userId
        const orders = await orderModel.find({userId:userId}).populate("items.productId")
        res.json(orders)
    }catch(error){
        res.status(500).json({message:"server error"})
    }
})


//view order details (user only)
//cancel order (user only)

//view all orders (admin only)
router.get("/all", async(req,res)=>{
    try{
        const orders = await orderModel.find().populate("items.productId").populate("userId")
        res.json(orders)
    }catch(error){
        res.status(500).json({message:"server error"})
    }
})

//update order status (admin only)
//cancel order (admin only)
//view order details per order id (admin only)

module.exports = router;
