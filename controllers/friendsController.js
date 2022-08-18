const User = require('../models/userModel');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.send_request_post = (req, res, next) => {
    // jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    //     if (err) return res.json({error: err, message: "JWT Auth Error"});
    console.log(req);
    console.log("-------------------------");
    console.log(req.body.request_id);
    User.findByIdAndUpdate(req.body.request_id,
        {$push: {"friend_requests": 1234}},
        {"new": true, "upsert": true},
        function (err, updatedUser) {
            if (err) return res.json({error: err});
            console.log(updatedUser);
            res.header("Access-Control-Allow-Origin", "http://localhost:3000");
            res.json({user: updatedUser});

        }
    )
}

exports.accept_request_post = (req, res, next) => {
    res.json("");
}