const express = require('express');
const bouquetOrderController = require('../controllers/bouquetOrder.controller');
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get('/bouquet-items', authMiddleware.authUser,bouquetOrderController.getBouquetItems);
router.post('/', authMiddleware.authUser,bouquetOrderController.createBouquetOrder);
router.get('/admin/bouquet-orders', authMiddleware.authAdmin, bouquetOrderController.getAllBouquetOrders);
router.patch('/reject-order/:orderId', authMiddleware.authUserAndAdmin, bouquetOrderController.rejectBouquetOrder);
router.patch('/confirm-order/:orderId', authMiddleware.authAdmin, bouquetOrderController.confirmBouquetOrder);

module.exports = router;