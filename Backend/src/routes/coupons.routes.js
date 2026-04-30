const express = require('express');
const couponController = require("../controllers/coupon.controller")
const productController = require("../controllers/product.controller")
const authMiddleware = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");
const router = express.Router();


router.post('/coupons', authMiddleware.authAdmin, couponController.createCoupon);
router.get('/coupons',authMiddleware.authAdmin, couponController.getCoupons);
router.patch('/coupons/:id', authMiddleware.authAdmin, couponController.updateCoupon);
router.delete('/coupons/:id',authMiddleware.authAdmin, couponController.deleteCoupon)

module.exports = router;