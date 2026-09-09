require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
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

// MySQL (Sequelize) setup
const sequelize = new Sequelize(
    process.env.DB_NAME || 'map_tracker',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || 'rootpassword',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false, // Set to true to see SQL queries in console
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL connected successfully via Sequelize');
        
        // Sync models (creates tables if they don't exist)
        // await sequelize.sync(); 
    } catch (error) {
        console.error('MySQL connection error:', error);
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
