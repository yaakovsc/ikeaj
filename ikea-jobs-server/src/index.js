/**
 * IKEA Jobs Server - Main Entry Point
 * 
 * This is the main Express server that handles job application submissions
 * and integrates with ActiveTrail API for sending emails.
 * 
 * Features:
 * - CORS enabled for cross-origin requests from the React frontend
 * - JSON body parsing for API requests
 * - Application routes mounted under '/api' prefix
 * - Environment variables loaded from .env file
 * 
 * Required environment variables (.env file):
 * - PORT: Server port (default: 3001)
 * - ACTIVE_TRAIL_TOKEN: Authentication token for ActiveTrail API
 * - RECIPIENT_EMAIL: Email address of the recruiter
 * - USER_PROFILE_ID: ActiveTrail user profile ID
 * 
 * To run:
 * npm start
 * 
 * Server will be available at: http://localhost:3001
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

// Enable CORS for frontend requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Mount application routes under /api prefix
app.use('/api', applicationRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});