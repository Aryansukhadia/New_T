import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sendResponse from './utils/response.js';
import pool, { connectDB } from './dbConnect/database.js';
import apiRoutes from './routes/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Parse allowed origins from environment variable
const allowedOrigins = process.env.FRONTEND_URLS.split(',').map(url => url.trim()) // Default fallback for development

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`⚠️  Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies and credentials
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', apiRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test route
app.get('/', (req, res) => {
    sendResponse(res, 200, 'Server is running......');
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
        console.log(`API documentation available at http://localhost:${port}/api-docs`);
    });
};

startServer();