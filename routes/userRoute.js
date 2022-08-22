const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../authenticateToken');

// Check Current User
router.get('/', authenticateToken, userController.current_user_get);

// Sign Up User
router.post('/sign-up', userController.sign_up_post);

// Sign In User
router.post('/sign-in', userController.log_in_post);

// Sign Out User
router.post('/sign-out', userController.log_out_post);


module.exports = router;
