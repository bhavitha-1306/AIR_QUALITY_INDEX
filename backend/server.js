// Only disable TLS in development (not on Vercel/production)
if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const createAuthRouter = require('./routes/auth');

// Load environment variables (local dev only — Vercel uses its own env)
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Serve landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// API endpoint to provide the WAQI API key
app.get('/api/key', (req, res) => {
    res.json({ apiKey: process.env.API_KEY });
});

// MongoDB Connection — cached for Vercel serverless
const MONGO_URI = process.env.MONGO_URI;
let usersCollection = null;
let isConnected = false;

async function connectDB() {
    if (isConnected && usersCollection) return usersCollection;

    try {
        const client = new MongoClient(MONGO_URI, {
            tls: true,
            tlsAllowInvalidCertificates: process.env.NODE_ENV !== 'production',
            serverSelectionTimeoutMS: 10000,
        });
        await client.connect();
        const db = client.db('airth');
        usersCollection = db.collection('users');
        isConnected = true;
        console.log('✅ Connected to MongoDB Atlas');
        return usersCollection;
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        throw err;
    }
}

// Mount auth routes (DB connects lazily on first request)
app.use('/api/auth', async (req, res, next) => {
    try {
        const collection = await connectDB();
        const router = createAuthRouter(collection);
        router(req, res, next);
    } catch (err) {
        res.status(500).json({ message: 'Database connection failed' });
    }
});

// For local development — start listening
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`🚀 Server running at http://localhost:${port}`);
    });
}

// Export for Vercel serverless
module.exports = app;
