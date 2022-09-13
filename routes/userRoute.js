const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../authenticateToken');

// Check Current User
router.get('/', authenticateToken, userController.current_user_get);

router.get('/posts-liked', authenticateToken, userController.liked_posts);

router.get('/all', authenticateToken, userController.get_users);

// Sign Up User
router.post('/sign-up', userController.sign_up_post);

// Sign In User
router.post('/log-in', userController.log_in_post);

// Sign Out User
router.post('/log-out', userController.log_out_post);

router.get('/:id', authenticateToken, userController.get_user);

router.put('/:id/biography', authenticateToken, userController.update_biography);


module.exports = router;
