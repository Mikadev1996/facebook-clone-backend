const User = require('../models/userModel');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.send_request_post = (req, res, next) => {
    // jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    //     if (err) return res.json({error: err, message: "JWT Auth Error"});
    const id = req.body.request_id;
    console.log(`req id 2: ${id}`);
    User.findByIdAndUpdate("62ffd6dcdc171c4451ef5967",
        { $push: {friend_requests: "1234"}},
        {},
        function (error, updated_user) {
            if (error) return res.json({error: error, message: "ffs"});
            console.log("success");
            res.json({user: updated_user});
        })
}

exports.accept_request_post = (req, res, next) => {
    res.json("");
}