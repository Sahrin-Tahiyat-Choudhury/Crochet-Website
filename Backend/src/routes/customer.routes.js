const express = require('express');

const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validationRules = require('../middlewares/validation.middleware');
const customerController = require('../controllers/customer.controller');
const router = express.Router();

router.get('/', authMiddleware.authAdmin,customerController.getAllCustomers);
router.post('/:id/message', authMiddleware.authAdmin, customerController.messageCustomer);

module.exports = router;