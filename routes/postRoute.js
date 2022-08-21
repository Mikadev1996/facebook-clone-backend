const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Get Posts / Post
router.get('/', postController.posts_all_get);
router.get('/profile', authenticateToken,  postController.user_posts_get);
router.get('/:id', postController.post_get);

// Create Post
router.post('/create', authenticateToken, postController.post_create);
// Delete Post
router.delete('/:id', authenticateToken, postController.post_delete)

// Update Post (Published/Unpublished)
router.get('/:id/update', authenticateToken, postController.post_update_get);
router.put('/:id/update', authenticateToken, postController.post_update_post);

router.put('/:id/like', postController.update_likes_post);

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401).json({error: "JWT Auth error"});
    req.token = token.replaceAll('"', '');
    next();
}



module.exports = router;

