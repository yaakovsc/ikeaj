const fetch = require('node-fetch');

/**
 * Sends an email via ActiveTrail API
 * 
 * This service function:
 * - Constructs appropriate email content based on recipient type (candidate/recruiter)
 * - Builds the ActiveTrail API payload with proper structure
 * - Sends POST request to ActiveTrail operational message endpoint
 * - Handles Hebrew content with UTF-8 encoding
 * 
 * Email types:
 * - Candidate email (isForCandidate=true): Confirmation of application submission
 * - Recruiter email (isForCandidate=false): New application notification with candidate details
 * 
 * Required environment variables:
 * - ACTIVE_TRAIL_TOKEN: Authentication token for ActiveTrail API
 * - RECIPIENT_EMAIL: Recruiter's email address
 * - USER_PROFILE_ID: ActiveTrail user profile identifier
 * 
 * @async
 * @function sendActiveTrailEmail
 * @param {Object} data - Application data
 * @param {string} data.fullName - Applicant's full name
 * @param {string} data.email - Applicant's email address
 * @param {string} data.phone - Applicant's phone number
 * @param {string} data.jobTitle - Title/description of the job position
 * @param {boolean} [isForCandidate=false] - Whether to send to candidate (true) or recruiter (false)
 * @returns {Promise<Object>} ActiveTrail API response
 * @throws {Error} If the API request fails
 * 
 * @example
 * // Send confirmation to candidate
 * await sendActiveTrailEmail({
 *   fullName: "ישראל ישראלי",
 *   email: "israel@example.com",
 *   phone: "050-1234567",
 *   jobTitle: "מנהל/ת סניף"
 * }, true);
 * 
 * // Send notification to recruiter
 * await sendActiveTrailEmail({
 *   fullName: "ישראל ישראלי",
 *   email: "israel@example.com",
 *   phone: "050-1234567",
 *   jobTitle: "מנהל/ת סניף"
 * }, false);
 */
const sendActiveTrailEmail = async (data, isForCandidate = false) => {
    const recipient = isForCandidate ? data.email : process.env.RECIPIENT_EMAIL;
    
    const subject = isForCandidate 
        ? `אישור הגשת מועמדות - IKEA` 
        : `מועמדות חדשה למשרה: ${data.jobTitle}`; 

    let body = "";
    if (isForCandidate) {
        body = 
            `שלום ${data.fullName},\n\n` +
            `תודה על הגשת המועמדות למשרה:\n` +
            `${data.jobTitle}\n\n` +
            `הפרטים התקבלו במערכת ונבדקים על ידי צוות הגיוס.\n` +
            `במידה ותימצא התאמה, נציג מטעמנו יצור איתך קשר.\n\n` +
            `בברכה,\nצוות IKEA Jobs`;
    } else {
        body = 
            `התקבלה פנייה חדשה עבור המשרה:\n` +
            `${data.jobTitle}\n\n` + 
            `פרטי המועמד/ת:\n` +
            `--------------------------\n` +
            `שם מלא:  ${data.fullName}\n` +
            `טלפון:   ${data.phone}\n` +
            `אימייל:  ${data.email}\n\n` +
            `נשלח אוטומטית ממערכת הגיוס`;
    }

    const payload = {
        email_package: [{
            email: recipient,
            pairs: [{ key: "fullName", value: data.fullName }]
        }],
        details: {
            name: `IKEA_${isForCandidate ? 'C' : 'R'}_${Date.now()}`,
            subject: subject,
            user_profile_id: parseInt(process.env.USER_PROFILE_ID),
            classification: "Operational",
            user_profile_fromname: "IKEA Jobs"
        },
        design: {
            content: body,
            language_type: "UTF-8",
            body_part_format: 1
        }
    };

    const response = await fetch('https://webapi.mymarketing.co.il/api/OperationalMessage/Message', {
        method: 'POST',
        headers: {
            'Authorization': process.env.ACTIVE_TRAIL_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return response.json();
};

module.exports = { sendActiveTrailEmail };