/**
 * Application Routes
 * 
 * Defines API routes for job application submissions.
 * 
 * Available routes:
 * - POST /send-application - Submit a job application
 * 
 * These routes are mounted under the '/api' prefix in the main server file,
 * so the full path is: POST /api/send-application
 */

const express = require('express');
const router = express.Router();
const { handleApplication } = require('../controllers/applicationController');

/**
 * POST /send-application
 * 
 * Handles job application submissions.
 * See applicationController.handleApplication for details.
 */
router.post('/send-application', handleApplication);

module.exports = router;