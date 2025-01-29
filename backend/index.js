require('dotenv').config(); // Load environment variables from .env

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require('./models/UserRegister'); // Updated to use the correct model

const app = express();
app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("MongoDB connection error:", err));

app.post('/register', (req, res) => {
    User.create(req.body)  
        .then(user => res.json(user))
        .catch(err => res.status(400).json(err));  
});

app.listen(3001, () => {
    console.log("server is running");
});
