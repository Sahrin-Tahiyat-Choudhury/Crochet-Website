const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const contentController = require('../controllers/content.controller');
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
})

const router = express.Router();

// User
router.get('/homepage', contentController.getHomepage);
router.get('/banners',contentController.getBanners);
router.get('/faq',contentController.getFaq);
router.get('/about',contentController.getAbout);
router.get('/policies',contentController.getPolicies);

// Admin
router.post('/banners', authMiddleware.authAdmin, upload.single('image') ,contentController.createBanner);
router.patch('/banners/:id', authMiddleware.authAdmin, contentController.updateBanner);
router.delete('/banners/:id', authMiddleware.authAdmin, contentController.deleteBanner);

router.patch('/homepage', authMiddleware.authAdmin, contentController.updateHomepage);
router.patch('/about', authMiddleware.authAdmin, contentController.updateAbout);
router.patch('/faq', authMiddleware.authAdmin, contentController.updateFaq);
router.patch('/policies', authMiddleware.authAdmin, contentController.updatePolicies);

module.exports = router;
