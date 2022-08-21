const jwt = require('jsonwebtoken');
const Post = require('../models/postModel')
const { body, validationResult } = require('express-validator');
const async = require('async');

// Get All Posts
exports.posts_all_get = (req, res, next) => {
    Post.find({})
        .populate("user")
        .sort({timestamp: -1})
        .exec((err, list_posts) => {
            if (err) return next(err);
            res.json({
                posts: list_posts
            })
        })
}

// Get User Posts
exports.user_posts_get = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});
        Post.find({user: authData._id})
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

// Get Single Posts
exports.post_get = (req, res, next) => {
    Post.findById(req.params.id)
        .populate("user")
        .sort({timestamp: -1})
        .exec((err, results) => {
            if (err) {
                res.json({error: err});
                return next(err);
            }
            res.json({
                post: results.post_details,
                comments: results.comments
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

exports.post_update_get = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) return res.json({error: err, message: "JWT Auth Error"});
        Post.findById(req.params.id)
            .populate("user")
            .exec((err, results) => {
                if (err) {
                    res.json({error: err});
                    return next(err);
                }
                res.json({
                    post: results
                })
            })
    })
}

exports.post_update_post = (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) res.json({error: "JWT Authentication Error"});
        let newPost = new Post({
            published: req.body.published,
            _id: req.params.id
        })

        Post.findByIdAndUpdate(req.params.id, newPost, {}, function (error, thePost) {
            if (error) {
                res.json({error: error});
                return next(error);
            }
            res.json({message: "Updated"});
        })
    })
}

exports.update_likes_post = (req, res, next) => {
    let newPost = new Post({
        likes: req.body.likes,
        _id: req.params.id
    })

    Post.findByIdAndUpdate(req.params.id, newPost, {}, function (error, thePost) {
        if (error) {
            res.json({error: error});
            return next(error);
        }
    })
}

exports.post_delete = (req, res, next) => {
    Post.findByIdAndRemove(req.params.id, function deletePost(err) {
        if (err) return next(err);
        res.redirect('/posts');
    })
}