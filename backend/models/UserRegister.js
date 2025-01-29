const mongoose = require('mongoose');

const userRegSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }

});

const User = mongoose.model('user', userRegSchema);

module.exports = User;
