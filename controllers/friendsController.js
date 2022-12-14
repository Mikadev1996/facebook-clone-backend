const User = require('../models/userModel');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const async = require('async');

exports.get_friends_list = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});

        User.findById(authData._id, 'friends')
            .populate('friends', 'firstname surname username')
            .exec((err, list_friends) => {
                if (err) return res.json({error: err, message: "Error fetching Data"});
                res.json({user_data: list_friends});
            });
    })
}

exports.send_request_post = [
    body('requested_id', 'ID Must not be empty').trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({error: errors, message: "Form validation error"});
            return;
        }

        jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
            if (err) return res.json({error: err, message: "JWT Auth Error"});
            const requested_id = req.body.requested_id;
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
                res.json({message: "Users updated"});
            })
        })
    }
]

exports.accept_request_post = [
    body('sender_id', 'ID Must not be empty').trim().isLength({min: 1}).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({error: errors, message: "Form validation error"});
            return;
        }

        jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
            if (err) return res.json({error: err, message: "JWT Auth Error"});
            const sender_id = req.body.sender_id;
            async.parallel({
                updated_requested(callback) {
                    User.findByIdAndUpdate(authData._id,
                        {$pull: {friend_requests: sender_id}},
                        {}).exec(callback);
                },
                updated_requested_friends(callback) {
                    User.findByIdAndUpdate(authData._id,
                        {$push: {friends: sender_id}},
                        {}).exec(callback);
                },
                updated_sender(callback) {
                    User.findByIdAndUpdate(sender_id,
                        {$pull: {friends_requested: authData._id}},
                        {}).exec(callback);
                },
                updated_sender_friends(callback) {
                    User.findByIdAndUpdate(sender_id,
                        {$push: {friends: authData._id}},
                        {}).exec(callback);
                }
            }, (err, results) => {
                if (err) return res.json({error: err, message: "Error updating users"});
                res.json({message: "Users updated"})
            })
        })
    }
]

exports.deny_request_post = [
    body('sender_id', 'ID Must not be empty').trim().isLength({min: 1}).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({error: errors, message: "Form validation error"});
            return;
        }

        jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
            if (err) return res.json({error: err, message: "JWT Auth Error"});
            const sender_id = req.body.sender_id;
            async.parallel({
                updated_requested(callback) {
                    User.findByIdAndUpdate(authData._id,
                        {$pull: {friend_requests: sender_id}},
                        {}).exec(callback);
                },
                updated_sender(callback) {
                    User.findByIdAndUpdate(sender_id,
                        {$pull: {friends_requested: authData._id}},
                        {}).exec(callback);
                }
            }, (err, results) => {
                if (err) return res.json({error: err, message: "Error updating users"});
                res.json({message: "Users updated"})
            })
        })
    }
]

exports.get_requests_lists = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});

        User.findById(authData._id, 'friend_requests')
            .select({friend_requests: 1})
            .populate('friend_requests', 'firstname surname username')
            .exec((err, list_friend_requests) => {
                if (err) return res.json({error: err, message: "Error fetching Data"});
                res.json({user_data: list_friend_requests});
            });
    })
}

exports.get_requested_lists = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});

        User.findById(authData._id, 'friends_requested')
            .exec((err, list_friends_requested) => {
                if (err) return res.json({error: err, message: "Error fetching Data"});
                res.json({user_data: list_friends_requested});
            });
    })
}

exports.get_unfriended_users = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});

        async.parallel({
            user_data(callback) {
                User.findById(authData._id, 'friends_requested friends')
                    .exec(callback);
            },
            all_users(callback) {
                User.find({}).exec(callback);
            }
        }, (err, result) => {
            if (err) return res.json({error: err, message: "Find Users error"});

            let friends = result.user_data.friends;
            friends.push(authData._id); // To filter current user from result
            const friendsRequested = result.user_data.friends_requested;
            const users = result.all_users;

            let filteredUsers = users.filter(item => !friendsRequested.includes(item._id));
            filteredUsers = filteredUsers.filter(item => !friends.includes(item._id));

            res.json({
                friends: filteredUsers
            })
        })
    })
}

exports.delete_friend_post =  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({error: errors, message: "Form validation error"});
        return;
    }

    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});
        async.parallel({
            updated_requested_friends(callback) {
                User.findByIdAndUpdate(authData._id,
                    {$pull: {friends: req.params.id}},
                    {}).exec(callback);
            },
            updated_sender_friends(callback) {
                User.findByIdAndUpdate(req.params.id,
                    {$pull: {friends: authData._id}},
                    {}).exec(callback);
            }
        }, (err, results) => {
            if (err) return res.json({error: err, message: "Error updating users"});
            res.json({message: "Users updated"})
        })
    })
}