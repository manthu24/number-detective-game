const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://guess-game:1234@cluster0.lxs1o.mongodb.net/'; // Replace with your connection string
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Player Schema
const playerSchema = new mongoose.Schema({
    name: String,
    score: Number,
    time: Number,
    guesses: Number,
    timestamp: { type: Date, default: Date.now }
});

const Player = mongoose.model('Player', playerSchema);

// Save Player Score
app.post('/api/save-score', async (req, res) => {
    const { name, score, time, guesses } = req.body;
    try {
        const player = new Player({ name, score, time, guesses });
        await player.save();
        res.status(201).json({ message: 'Score saved successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save score' });
    }
});

// Get Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Player.find().sort({ score: -1 }).limit(10);
        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});