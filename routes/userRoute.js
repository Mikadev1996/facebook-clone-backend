const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Check Current User
router.get('/', authenticateToken, userController.current_user_get);

// Sign Up User
router.post('/sign-up', userController.sign_up_post);

// Sign In User
router.post('/sign-in', userController.log_in_post);

// Sign Out User
router.post('/sign-out', userController.log_out_post);

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401).json({error: "JWT Auth error"});
    req.token = token.replaceAll('"', '');
    console.log(req.token);
    next();
}


module.exports = router;
