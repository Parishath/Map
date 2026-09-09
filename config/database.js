const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'map_tracker',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || 'rootpassword',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false, 
    }
);

module.exports = sequelize;
