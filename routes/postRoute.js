const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticateToken = require('../authenticateToken');

// Get Posts / Post
router.get('/', postController.posts_all_get);
router.get('/profile', authenticateToken,  postController.user_posts_get);

// Create Post
router.post('/create', authenticateToken, postController.post_create);
// Delete Post
router.delete('/:id', authenticateToken, postController.post_delete)

// Like / Unlike Post
router.put('/:id/like', authenticateToken, postController.post_like);
router.put('/:id/unlike', authenticateToken, postController.post_unlike);

module.exports = router;

