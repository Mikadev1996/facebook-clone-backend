const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    text: {type: String, required: true},
    likes: {type: Number, required: true, default: 0},
    timestamp: {type: Date, required: true, default: Date.now()},
    user: {type: Schema.Types.ObjectId, ref:'User', required: true},
})

PostSchema
    .virtual('url')
    .get(function() {
        return '/posts/' + this._id;
    });

module.exports = mongoose.model('Post', PostSchema);