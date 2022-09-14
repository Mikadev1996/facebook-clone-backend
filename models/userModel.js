const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstname: {type: String, required: false},
    surname: {type: String, required: false},
    username: {type: String, required: false},
    password: {type: String, required: false},
    date_of_birth: {type: Date},
    date_joined: {type: Date},
    biography: {type: String, default: ""},
    job: {type: String, default: ""},
    friends: [{type: Schema.Types.ObjectId, ref: 'User', default: []}],
    friend_requests: [{type: Schema.Types.ObjectId, ref: 'User', default: []}],
    friends_requested: [{type: Schema.Types.ObjectId, ref: 'User', default: []}],
    likes: [{type: Schema.Types.ObjectId, ref: 'Post', default: []}],
    facebookId: {type: String, required: false},
})

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', UserSchema);