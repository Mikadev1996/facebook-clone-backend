const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');

router.post('/send', friendsController.send_request_post);

router.post('/accept', friendsController.accept_request_post);

router.get('/friends_list', friendsController.get_friends_list);

router.get('/requests_list', friendsController.get_requests_lists);

router.get('/requested_list', friendsController.get_requested_lists);

module.exports = router;