const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserRegister');

const router = express.Router();

router.post('/register', async (req, res) => { 
    const { username, email, password } = req.body; 

    try { 
        const existingUser = await User.findOne({ email }); 
        if (existingUser) { 
            return res.status(400).json({ message: 'User already exists' });
        } 
 
        const newUser = new User({ username, email, password }); 
        await newUser.save(); 
 
        res.status(201).json({ message: 'User registered successfully' }); 
    } catch (err) { 
        res.status(500).json({ message: 'Error registering user', error: err.message }); 
    }
});

router.post('/login', async (req, res) => { 
    const { email, password } = req.body; 
 
    try { 
        const user = await User.findOne({ email }); 
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });
 
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
 
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); 

        res.json({ message: 'Login successful', token }); 
    } catch (err) { 
        res.status(500).json({ message: 'Error logging in', error: err.message }); 
    } 
}); 

router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude passwords
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
});

module.exports = router;
