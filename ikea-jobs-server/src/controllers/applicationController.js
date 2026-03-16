const { sendActiveTrailEmail } = require('../services/activeTrailService');

/**
 * Handles job application submissions by sending notification emails
 * 
 * This controller:
 * - Receives application data from the frontend
 * - Sends two emails in parallel via ActiveTrail:
 *   1. Confirmation email to the candidate
 *   2. Notification email to the recruiter
 * - Returns success/error response to the client
 * 
 * Expected request body:
 * - fullName: Applicant's full name
 * - email: Applicant's email address
 * - phone: Applicant's phone number
 * - job: Job object with description field
 * 
 * @async
 * @function handleApplication
 * @param {Object} req - Express request object with application data in body
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status
 * 
 * @example
 * // POST /api/send-application
 * // Request body:
 * {
 *   "fullName": "ישראל ישראלי",
 *   "email": "israel@example.com",
 *   "phone": "050-1234567",
 *   "job": { "description": "מנהל/ת סניף" }
 * }
 * 
 * // Success response: { success: true, message: 'Emails sent successfully' }
 * // Error response: { success: false, error: 'Failed to send emails' }
 */
const handleApplication = async (req, res) => {
    try {
        const { fullName, email, phone, job } = req.body;
        const jobTitle = job?.description || "משרה כללית";

        await Promise.all([
            sendActiveTrailEmail({ fullName, email, phone, jobTitle }, false),
            sendActiveTrailEmail({ fullName, email, phone, jobTitle }, true) 
        ]);

        res.status(200).json({ success: true, message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ success: false, error: 'Failed to send emails' });
    }
};

module.exports = { handleApplication };