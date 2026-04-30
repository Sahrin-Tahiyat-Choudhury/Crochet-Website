const express = require('express');
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

/*
User Access
- View my orders
- Place order
- View order history
- View order details
- Track order status
- Request refund*
*/
router.post('/place-order', authMiddleware.authUser, orderController.placeOrder);
router.get('/my-orders', authMiddleware.authUser, orderController.getMyOrders);


router.get('/order-history', authMiddleware.authUser, orderController.getOrderHistory);
router.get('/order-details/:orderId', authMiddleware.authUser, orderController.getOrderDetails);
router.patch('/track-order/:orderId', authMiddleware.authUser, orderController.trackOrderStatus);
router.post('/refund-request/:orderId',authMiddleware.authUser, orderController.refundRequest)
/* 
Admin Access

-View all orders
-Update order status
- Cancel orders
- Handle refunds (basic structure): Refunds will only be considered under the following conditions:

- The product is damaged during transit

- You receive an incorrect or incomplete order (missing items)
- View order details per customer

*/
router.get('/all-orders', authMiddleware.authAdmin, orderController.getAllOrders);
router.patch('/update-order-status/:orderId', authMiddleware.authAdmin, orderController.updateOrderStatus);


router.patch('/cancel-order/:orderId', authMiddleware.authUserAndAdmin, orderController.cancelOrder);
router.patch('/refund-order/:orderId', authMiddleware.authAdmin, orderController.refundOrder);

module.exports = router;