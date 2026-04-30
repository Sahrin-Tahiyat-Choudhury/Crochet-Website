const express = require('express');
const authMiddleware = require("../middlewares/auth.middleware");
const cartController = require("../controllers/cart.controller")

const router = express.Router();

router.post('/add', authMiddleware.authUser, cartController.addToCart);
router.get('/', authMiddleware.authUser, cartController.getCart);
router.patch('/item/:productId', authMiddleware.authUser, cartController.updateCartItem);
router.delete('/item/:productId', authMiddleware.authUser, cartController.removeCartItem);
router.delete('/clear', authMiddleware.authUser, cartController.clearCart);
router.post('/apply-coupon', authMiddleware.authUser, cartController.applyCoupon);
router.delete('/coupon', authMiddleware.authUser, cartController.removeCoupon);
router.post('/checkout', authMiddleware.authUser, cartController.checkout);

module.exports = router;