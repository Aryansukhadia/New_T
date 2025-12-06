import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Read CA certificate if provided
let sslConfig = {
    rejectUnauthorized: false, // Set to false for Aiven and other cloud providers with self-signed CAs
};

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: sslConfig,
    // Connection timeout
    connectionTimeoutMillis: 10000,
    // Idle timeout
    idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Function to connect to the database
export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database successfully');
        client.release();
        return true;
    } catch (error) {
        console.error('Failed to connect to PostgreSQL database:', error.message);
        return false;
    }
};

export default pool;

