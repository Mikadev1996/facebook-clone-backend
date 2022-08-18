const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');

router.post('/send', friendsController.send_request_post);

router.post('/accept', friendsController.accept_request_post);

module.exports = router;