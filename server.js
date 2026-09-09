require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createClient } = require('redis');

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware
app.use(cors());
app.use(express.json());

// Redis setup
const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// MongoDB setup
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/map_tracker', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

// Basic Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Universal Location Tracking API Service' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Start Server
const startServer = async () => {
    await redisClient.connect();
    console.log('Redis connected successfully');
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`Map Microservice running on port ${PORT}`);
    });
};

startServer();
