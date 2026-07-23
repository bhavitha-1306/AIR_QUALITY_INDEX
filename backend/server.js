// Fix for Node.js v22 strict TLS with MongoDB Atlas (development only)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const createAuthRouter = require('./routes/auth');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
let usersCollection;

async function connectDB() {
    try {
        const client = new MongoClient(MONGO_URI, {
            tls: true,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true,
            serverSelectionTimeoutMS: 10000,
        });
        await client.connect();
        const db = client.db('airth');
        usersCollection = db.collection('users');
        console.log('✅ Connected to MongoDB Atlas successfully');

        // Mount auth routes AFTER DB is connected
        app.use('/api/auth', createAuthRouter(usersCollection));

        // Start server only after DB is ready
        app.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
        });

    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
}

// API endpoint to provide the API key
app.get('/api/key', (req, res) => {
    res.json({ apiKey: process.env.API_KEY });
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Serve landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Connect to DB and start
connectDB();
