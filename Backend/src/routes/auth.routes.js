const express = require('express');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validationRules = require('../middlewares/validation.middleware');

const router = express.Router();

router.post('/register', validationRules.registerUserValidationRules, authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUserController);

/**
 * @access private
 */
router.get("/get-me", authMiddleware.authUserAndAdmin, authController.getMeController)

router.get("/get-all-users", authMiddleware.authAdmin, authController.getAllUsersController)
router.patch("/change-password", authMiddleware.authUserAndAdmin, userController.changePassword)
router.patch("/update-profile", authMiddleware.authUserAndAdmin, userController.updateProfile)

module.exports = router;