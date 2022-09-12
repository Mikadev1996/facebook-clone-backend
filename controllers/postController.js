const jwt = require('jsonwebtoken');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const { body, validationResult } = require('express-validator');
const async = require('async');

// Get All Posts
exports.posts_all_get = (req, res, next) => {
    Post.find({})
        .populate("user", 'username')
        .sort({timestamp: -1})
        .exec((err, list_posts) => {
            if (err) return next(err);
            res.json({
                posts: list_posts
            })
        })
}

exports.posts_by_friends = (req , res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});

        async.parallel({
            posts_list(callback) {
                Post.find({}, '')
                    .populate('user', '-password')
                    .sort({timestamp: -1})
                    .exec(callback);
            },
            friends_list(callback) {
                User.findById(authData._id, 'friends')
                    .populate('friends', '-password')
                    .exec(callback);
            },
            likes_list(callback) {
                User.findById(authData._id, 'likes')
                    .exec(callback);
            }
        }, (err, result) => {
            if (err) return res.json({error: err, message: "JWT Auth Error"});

            const likes = result.likes_list.likes;
            let friends = result.friends_list.friends.map(data => data._id.toString());
            friends.push(authData._id)

            let posts = result.posts_list;
            posts = posts.filter(item => friends.includes(item.user._id.toString()));

            posts = posts.map(item => ({...item._doc, isLiked: likes.includes(item._doc._id.toString())}));

            res.json({
                posts: posts,
            })
        })
    })
}

// Get User Posts
exports.user_posts_get = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});

        Post.find({user: req.params.id})
            .populate('user', 'username')
            .sort({timestamp: -1})
            .exec((err, list_posts) => {
                if (err) return next(err);
                res.json({
                    posts: list_posts
                })
            })
    })
}

exports.post_create = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) res.json({error: "JWT Authentication Error"});
        let newPost = new Post({
            text: req.body.text,
            likes: 0,
            timestamp: Date.now(),
            user: authData._id,
        })

        newPost.save((err) => {
            if (err) return res.statusCode(401).json({error: err});
            res.json({message: "Post Created"})
        })
    })
}

exports.post_delete = (req, res, next) => {
    Post.findByIdAndRemove(req.params.id, function deletePost(err) {
        if (err) return next(err);
        res.redirect('/posts');
    })
}

exports.post_like = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) res.json({error: "JWT Authentication Error"});
        const post_id = req.body.post_id;

        async.parallel({
            update_user(callback) {
                User.findByIdAndUpdate(authData._id, {$push: {likes: post_id}})
                    .exec(callback);
            },
            update_post(callback) {
                Post.findOneAndUpdate({_id: post_id}, {$inc: {'likes': 1}})
                    .exec(callback);
            }
        }, (err, result) => {
            if (err) return res.json({error: err});
            res.json("Post Liked");
        })
    })
}

exports.post_unlike = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) res.json({error: "JWT Authentication Error"});
        const post_id = req.body.post_id;

        async.parallel({
            update_user(callback) {
                User.findByIdAndUpdate(authData._id, {$pull: {likes: post_id}})
                    .exec(callback);
            },
            update_post(callback) {
                Post.findOneAndUpdate({_id: post_id}, {$inc: {'likes': -1}})
                    .exec(callback);
            }
        }, (err, result) => {
            if (err) return res.json({error: err});
            res.json("Post Liked");
        })
    })
}