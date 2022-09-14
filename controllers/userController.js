const { body, validationResult } = require('express-validator')
const User = require('../models/userModel');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.get_user = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});

        User.findById(req.params.id, '-password')
            .populate('friends', '-password')
            .exec((err, user_data) => {
                if (err) return res.json({error: err, message: "Mongoose error"});

                res.json({user_data: user_data});
            })
    })
}

// Current User
exports.current_user_get = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});

        User.findById(authData._id, '-password')
            .populate('friends', '-password')
            .exec((err, user_data) => {
                if (err) return res.json({error: err, message: "Mongoose error"});

                res.json({user: user_data});
            })
    })
}

exports.liked_posts = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});

        User.findById(authData._id, 'likes')
            .exec((err, list_liked) => {
                if (err) return res.json({error: err, message: "Error fetching Data"});
                res.json({user_data: list_liked});
            });
    })
}

exports.get_users = (req , res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});

        User.find({_id: { $nin: authData._id}} , 'firstname surname username')
            .exec((err, list_users) => {
                if (err) res.json({error: err, message: "Mongoose Error"});
                res.json({users: list_users});
            })
    })
}

// Sign Up
exports.sign_up_post = [
    body('firstname', 'Firstname must not be empty.').trim().isLength({min: 1}).escape(),
    body('surname', 'Surname must not be empty.').trim().isLength({min: 1}).escape(),
    body('username', 'Username must not be empty.').trim().isLength({min: 1}).escape(),
    body('password', 'Password must not be empty.').trim().isLength({min: 1}).escape(),
    body('date_of_birth', 'Date of Birth must not be empty.').trim().isLength({min: 1}).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({error: errors, message: "Form validation error"});
            return;
        }

        bcrypt.hash(req.body.password, 10, (err, hashedPass) => {
            if (err) return res.json({error: err, message: "hash error"});

            const user = new User({
                firstname: req.body.firstname,
                surname: req.body.surname,
                username: req.body.username,
                password: hashedPass,
                date_of_birth: req.body.date_of_birth,
                date_joined: Date.now(),

            }).save((err) => {
                if (err) return res.json({error: err, message: "form error"});
                res.redirect('http://localhost:3000/');
            })
        })
    }
]

// Log In
exports.log_in_post = [
    body('username', 'Name must not be empty.').trim().isLength({min: 1}).escape(),
    body('password', 'Password must not be empty.').trim().isLength({min: 1}).escape(),

    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({error: errors, message: "Form validation error"});
            return;
        }

        passport.authenticate("local", { session: false }, (err, user) => {
            if (err || !user) {
                return res.status(401).json({
                    message: "Incorrect Username or Password",
                });
            }

            jwt.sign(
                { _id: user._id, username: user.username , firstname: user.firstname, surname: user.surname, friends: user.friends},
                process.env.JWT_KEY,
                { expiresIn: "30m" },
                (err, token) => {
                    if (err) return res.status(400).json(err);
                    res.json({
                        token: token,
                        user: { _id: user._id, username: user.username, firstname: user.firstname, surname: user.surname, friends: user.friends},
                    });
                }
            );
        })(req, res);
    }
]

exports.update_biography = [
    body('date_of_birth', 'Value must not be empty.').trim().isLength({min: 1}).escape(),
    body('biography', 'Biography must not be empty.').trim().isLength({min: 1}).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({error: errors, message: "Form validation error"});
            return;
        }

        jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
            if (err) return res.json({error: err, message: "JWT Auth Error"});

            if (req.params.id !== authData._id) return res.json({error: "Invalid user access"});

            User.findByIdAndUpdate(authData._id, {
                biography: req.body.biography,
                date_of_birth: req.body.date_of_birth,
            }).exec((err, result) => {
                if (err) return res.json({error: err});
                res.json({message: "user updated"});
            })
        })
    }
]

// Log Out
exports.log_out_post = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            res.send({error: err});
            return next(err);
        }
    })
    res.redirect('/');
}
exports.facebook_callback = (req, res, next) => {
    passport.authenticate("facebook", {session: false}, (err, user, info) => {
        if (err) return res.json({error: err});

        jwt.sign({ _id: user._id, username: user.username , firstname: user.firstname, surname: user.surname, friends: user.friends, facebookId: user.facebookId},
            process.env.JWT_KEY,
            { expiresIn: "30m" },
            (err, token) => {
                if (err) return res.status(400).json(err);
                res.redirect(`http://localhost:3000/auth/${token}/${user._id}`);
                // res.json({
                //     token: token,
                //     user: { _id: user._id, username: user.username, firstname: user.firstname, surname: user.surname, friends: user.friends, facebookId: user.facebookId},
                // });
            }
        );
    })(req, res, next);
}