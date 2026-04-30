const express = require('express');
const authMiddleware = require("../middlewares/auth.middleware");
const reviewController = require("../controllers/review.controller")

const router = express.Router();

router.post('/product/:productId',authMiddleware.authUserAndAdmin, reviewController.postReview);
router.patch('/:reviewId',authMiddleware.authUserAndAdmin, reviewController.editReview);
router.patch('/:reviewId/respond',authMiddleware.authAdmin, reviewController.respondToReview);
router.delete('/:reviewId',authMiddleware.authUserAndAdmin, reviewController.deleteReview);

module.exports = router;