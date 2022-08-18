const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstname: {type: String, required: true},
    surname: {type: String, required: true},
    username: {type: String, required: true},
    date_of_birth: {type: Date},
    date_joined: {type: Date},
    biography: {type: String, default: ""},
    job: {type: String, default: ""},
    friends: {type: Array, default: []},
    friend_requests: {type: Array, default: []},
    friends_requested: {type: Array, default: []}
})

module.exports = mongoose.model('User', UserSchema);