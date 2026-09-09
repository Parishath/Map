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

const sequelize = require('./config/database');
const { UserRoute, LocationPing, AssignedLocation } = require('./models/index');

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL connected successfully via Sequelize');
        // Auto-create/alter tables based on models
        await sequelize.sync({ alter: true }); 
        console.log('MySQL schema synced');
    } catch (error) {
        console.error('MySQL connection error:', error);
    }
};

// --- API Routes ---

// 1. Ingest GPS Pings from Mobile Apps
app.post('/api/track/ping', async (req, res) => {
    const { tenant_id, user_id, lat, lng, accuracy, ping_timestamp } = req.body;
    
    if (!tenant_id || !user_id || !lat || !lng) {
        return res.status(400).json({ error: 'Missing required tracking parameters' });
    }

    try {
        const route_date = new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD
        
        // Find or create today's route for the user
        let [userRoute] = await UserRoute.findOrCreate({
            where: { tenant_id, user_id, route_date },
            defaults: { vehicle_type: 'unknown' }
        });

        // Store the individual GPS ping
        await LocationPing.create({
            user_route_id: userRoute.id,
            lat,
            lng,
            accuracy,
            ping_timestamp: ping_timestamp || new Date()
        });

        res.json({ success: true, message: 'Ping recorded' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to record ping' });
    }
});

// 2. Fetch User's Route (GeoJSON for Leaflet/Google)
app.get('/api/track/route/:userId', async (req, res) => {
    const { userId } = req.params;
    const { tenant_id, date } = req.query;
    const route_date = date || new Date().toISOString().split('T')[0];

    try {
        const userRoute = await UserRoute.findOne({
            where: { tenant_id, user_id: userId, route_date },
            include: [{ model: LocationPing, as: 'pings', order: [['ping_timestamp', 'ASC']] }]
        });

        if (!userRoute) {
            return res.json({ success: true, route: [], total_km: 0 });
        }

        const coordinates = userRoute.pings.map(ping => [parseFloat(ping.lat), parseFloat(ping.lng)]);
        
        res.json({ 
            success: true, 
            route: coordinates, 
            total_km: parseFloat(userRoute.total_km_traveled),
            reimbursement: parseFloat(userRoute.total_reimbursement)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch route' });
    }
});

// 3. Assign Multiple Locations
app.post('/api/locations/assign', async (req, res) => {
    const { tenant_id, user_id, locations } = req.body;
    // locations array: [{ location_name, lat, lng, radius_meters }]

    try {
        // Example bulk create
        const assigned = await AssignedLocation.bulkCreate(
            locations.map(loc => ({
                tenant_id,
                user_id,
                ...loc
            }))
        );
        res.json({ success: true, assigned_count: assigned.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to assign locations' });
    }
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
