const User = require('../models/userModel');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const async = require('async');

exports.send_request_post = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});
        const requested_id = req.body.request_id;
        console.log(`req id 2: ${requested_id}`);
        async.parallel({
            updated_requested(callback) {
                User.findByIdAndUpdate(requested_id,
                    {$push: {friend_requests: authData._id}},
                    {}).exec(callback);
            },
            updated_sender(callback) {
                User.findByIdAndUpdate(authData._id,
                    {$push: {friends_requested: requested_id}},
                    {}).exec(callback);
            }
        }, (err, results) => {
            if (err) return res.json({error: err, message: "Error updating users"});
            res.json({
                updated_requested: results.updated_requested,
                updated_sender: results.updated_sender
            })
        })
    })
}

exports.accept_request_post = (req, res, next) => {
    res.json("");
}