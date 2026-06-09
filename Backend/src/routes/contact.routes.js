const express = require('express');
const contactController = require('../controllers/contact.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', contactController.createContactMessage);
router.get('/messages', authMiddleware.authAdmin, contactController.getContactMessages);

module.exports = router;
