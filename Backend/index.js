import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sendResponse from './utils/response.js';
import pool, { connectDB } from './dbConnect/database.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
    sendResponse(res, 200, 'Hello World!');
});


const isConnected = await connectDB();
if (isConnected) {
    console.log('Database connected successfully');
} else {
    console.log('Database connection failed');
}

// Database test route
app.get('/db-test', async (req, res) => {
    try {
        sendResponse(res, 200, 'Database connected successfully', isConnected);
    } catch (error) {
        console.error('Database error:', error);
        sendResponse(res, 500, 'Database connection failed', { error: error.message });
    }
});

// Connect to database and start server
const startServer = async () => {
    await connectDB();

    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
};

startServer();