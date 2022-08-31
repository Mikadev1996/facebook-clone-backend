const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const authenticateToken = require('../authenticateToken');

router.post('/send', authenticateToken, friendsController.send_request_post);

router.post('/accept', authenticateToken, friendsController.accept_request_post);

router.post('/deny', authenticateToken, friendsController.deny_request_post);

router.get('/', authenticateToken, friendsController.get_friends_list);

router.get('/requests', authenticateToken, friendsController.get_requests_lists);

router.get('/requested', authenticateToken, friendsController.get_requested_lists);

router.get('/filtered', authenticateToken, friendsController.get_filtered_users);

module.exports = router;