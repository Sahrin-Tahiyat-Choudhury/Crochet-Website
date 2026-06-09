const express = require('express');
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/order',authMiddleware.authUser, paymentController.createOrder)
router.post('/verify', authMiddleware.authUser, paymentController.verifyPayment)

module.exports = router;