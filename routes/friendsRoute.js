const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
// const authenticateToken = require('../authenticateToken');

router.post('/send', authenticateToken, friendsController.send_request_post);

router.post('/accept', authenticateToken, friendsController.accept_request_post);

router.get('/', friendsController.get_friends_list);

router.get('/requests', authenticateToken, friendsController.get_requests_lists);

router.get('/requested', friendsController.get_requested_lists);

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401).json({error: "JWT Auth error"});
    req.token = token.replaceAll('"', '');
    next();
}


module.exports = router;