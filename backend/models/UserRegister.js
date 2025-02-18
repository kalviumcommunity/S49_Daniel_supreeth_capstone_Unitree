const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userRegSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userRegSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const UserRegister = mongoose.model('UserRegister', userRegSchema);

module.exports = UserRegister;
