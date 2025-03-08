const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000;
const SECRET_KEY = 'supersecretkey';

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/slotmachine', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, match: /^[a-zA-Z0-9]{1,16}$/ },
    password: { type: String, required: true, minlength: 6, match: /^[a-zA-Z0-9]{6,16}$/ },
    balance: { type: Number, default: 100 }
});

const User = mongoose.model('User', UserSchema);

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: 'User already exists' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, balance: user.balance });
});

app.get('/balance', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded.userId);
        res.json({ balance: user.balance });
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.post('/slot', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded.userId);
        
        if (user.balance < 1) return res.status(400).json({ error: 'Not enough balance' });
        
        user.balance -= 1;
        const result = Math.random() < 0.3 ? 10 : 0;
        user.balance += result;
        await user.save();
        
        res.json({ win: result, newBalance: user.balance });
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
