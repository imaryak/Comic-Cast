const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {type: 'string'},
    username: {type: 'string', unique: true},
    email: {type: 'string', unique: true},
    password: {type: 'string'},
    password2: {type: 'string'},
    dateOfBirth : {type: 'date'},
    gender : {type : 'string', enum: ["Male", "Female", "Other"],},
    country: {type: 'string'},
    about: {type: 'string'},
    website: {type: 'string'},
    avatar: {type: 'string'},
    confirmed: {type: Boolean, default: false},
});

const User = mongoose.model('User', UserSchema);

module.exports = User;