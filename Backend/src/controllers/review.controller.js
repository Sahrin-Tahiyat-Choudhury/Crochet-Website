const orderModel = require('../models/order.model')
const productModel = require('../models/product.model');
const reviewModel = require('../models/review.model');

async function postReview(req,res) {
    try{
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Only users can post reviews' });
        }

        const {rating,comment} = req.body;
        const {productId} = req.params;

        
        if (!rating || !comment) {
            return res.status(400).json({ message: 'Rating and comment are required' });
        }

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const existingReview = await reviewModel.findOne({
            userId: req.user.id,
            productId
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You already reviewed this product' });
        }

        const hasPurchased = await orderModel.findOne({
            userId: req.user.id,
            productId,
            status: "delivered"
        });
        if (!hasPurchased) {
            return res.status(403).json({ message: "You can only review products you have purchased" });
        }

         const review = await reviewModel.create({
            userId: req.user.id,
            productId,
            rating,
            comment
        });
            return res.status(201).json({
                message:"Review created successfully", 
                review
            })
    } catch(error){
        return res.status(500).json({
            message: "Error Posting Review", 
            error: error.message})
    }
}

async function editReview(req,res){
    try{
        const {reviewId} = req.params;
        const { rating, comment } = req.body;

        if (!rating && !comment) {
            return res.status(400).json({ message: 'Please provide rating or comment to update' });
        }

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const review = await reviewModel.findById(reviewId);
        if(!review) {
            return res.status(404).json({message:'Review not found'})
        }

        const isOwner = review.userId.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        if(!isOwner && !isAdmin){
                return res.status(403).json({message: "You don't have access"});
            }

        const updatedReview = await reviewModel.findByIdAndUpdate(
            reviewId,
            { ...req.body },         // pass the new data from request body
            { new: true, runValidators: true }  // return updated doc & validate
        ); 

        return res.status(200).json({
            message: 'Review updated successfully'
        });
        }
        catch(error){
            res.status(500).json({message:'Error updating review',error:error.message});
        }
}

async function respondToReview(req, res) {
    try {
        const { reviewId } = req.params;
        const { adminResponse } = req.body;

        // 1. Check if admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can respond to reviews" });
        }

        // 2. Validate reply
        if (!adminResponse) {
            return res.status(400).json({ message: "Please provide a reply" });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        const updatedReview = await reviewModel.findByIdAndUpdate(
            reviewId,
            { adminResponse },
            { new: true }
        );

        return res.status(200).json({
            message: "Reply added successfully",
            review: updatedReview
        });

    } catch (error) {
        res.status(500).json({ message: "Error responding to review", error: error.message });
    }
}

async function deleteReview(req,res){
    try{
        const {reviewId} = req.params;
        const review = await reviewModel.findById(reviewId);

        if(!review) {
            return res.status(404).json({message:'Review not found'})
        }

        const isOwner = review.userId.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        if(!isOwner && !isAdmin){
                return res.status(403).json({message: "You don't have access"});
            }

        await reviewModel.findByIdAndDelete(reviewId);

        return res.status(200).json({
            message: 'Review deleted successfully'
        });
        }
        catch(error){
            res.status(500).json({message:'Error deleting review',error:error.message});
        }
}

async function getProductReviews(req, res) {
    try {
        const { productId } = req.params;

        const reviews = await reviewModel
            .find({ productId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching reviews',
            error: error.message
        });
    }
}

async function getAllReviews(req, res) {
    try {
        const reviews = await reviewModel
            .find()
            .populate('userId', 'name')
            .populate('productId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(reviews);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching reviews',
            error: error.message
        });
    }
}

module.exports = {postReview,editReview,respondToReview,deleteReview,getProductReviews,getAllReviews}