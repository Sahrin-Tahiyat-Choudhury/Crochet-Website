const express = require('express');
const customOrderController = require('../controllers/customOrder.controller')
const authMiddleware = require("../middlewares/auth.middleware");

const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
})

const router = express.Router();

router.post('/', authMiddleware.authUser, upload.single('referenceImage'), customOrderController.createCustomOrder);
router.get('/custom-orders', authMiddleware.authAdmin , customOrderController.getCustomOrders);
router.patch('/:orderId', authMiddleware.authAdmin, customOrderController.updateCustomOrderStatus);

module.exports = router;