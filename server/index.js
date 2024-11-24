const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require("cors")
const bodyParser = require("body-parser")
const User = require("./modal/userModal")
const app = express();
const PORT = 3000;

app.use(cors())
app.use(bodyParser.json())
// Connect to MongoDB
mongoose.connect('mongodb+srv://apple825030:Rsamanta@2003@cluster0.lnv2i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const jwt = require("jsonwebtoken")
// Routes
app.post('/signup', async (req, res) => {
    try {
        console.log(req.body)
        const { username, password,email } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password and create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword,email });
        await newUser.save();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log(req.body)
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        
        // Generate JWT token
        const token = jwt.sign({ id: user._id, username: user.username }, "rahul", { expiresIn: '1h' });
        
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
