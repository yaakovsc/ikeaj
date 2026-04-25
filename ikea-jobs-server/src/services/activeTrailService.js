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
const emailWrapper = (content) => `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0058a3;padding:20px 32px;">
            <span style="color:#FFDA1A;font-size:28px;font-weight:900;letter-spacing:2px;">IKEA</span>
            <span style="color:#fff;font-size:14px;margin-right:16px;vertical-align:middle;">משרות | Careers</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8;border-top:1px solid #e0e0e0;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">
              © IKEA Israel &nbsp;|&nbsp; הודעה זו נשלחה אוטומטית ממערכת הגיוס של IKEA
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

const candidateEmailHtml = (data) => emailWrapper(`
  <p style="margin:0 0 8px;font-size:15px;color:#333;">שלום <strong style="color:#000;">${data.fullName}</strong>,</p>
  <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.7;">
    תודה על הגשת המועמדות. קיבלנו את פרטיך ונעבור עליהם בהקדם.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0"
         style="border:1px solid #e0e0e0;margin-bottom:28px;">
    <tr>
      <td style="background:#0058a3;padding:12px 20px;">
        <span style="color:#fff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">פרטי המשרה</span>
      </td>
    </tr>
    <tr>
      <td style="padding:20px;">
        <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#000;">${data.jobTitle}</p>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0"
         style="border:1px solid #e0e0e0;margin-bottom:28px;">
    <tr>
      <td style="background:#f8f8f8;padding:12px 20px;border-bottom:1px solid #e0e0e0;">
        <span style="color:#333;font-size:13px;font-weight:700;">מה קורה עכשיו?</span>
      </td>
    </tr>
    <tr>
      <td style="padding:20px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;color:#555;font-size:14px;line-height:1.6;">
              <span style="color:#0058a3;font-weight:700;margin-left:8px;">1.</span> המועמדות שלך נקלטה במערכת הגיוס שלנו.
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#555;font-size:14px;line-height:1.6;">
              <span style="color:#0058a3;font-weight:700;margin-left:8px;">2.</span> צוות הגיוס יבחן את הפרופיל שלך.
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#555;font-size:14px;line-height:1.6;">
              <span style="color:#0058a3;font-weight:700;margin-left:8px;">3.</span> במידה ותימצא התאמה, נציג/ה מטעמנו יצור/תיצור איתך קשר.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <p style="margin:0;font-size:14px;color:#888;line-height:1.6;">
    בברכה,<br/>
    <strong style="color:#000;">צוות הגיוס של IKEA ישראל</strong>
  </p>
`);

const recruiterEmailHtml = (data) => emailWrapper(`
  <p style="margin:0 0 24px;font-size:15px;color:#333;line-height:1.7;">
    התקבלה מועמדות חדשה דרך מערכת הגיוס.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0"
         style="border:1px solid #e0e0e0;margin-bottom:24px;">
    <tr>
      <td style="background:#0058a3;padding:12px 20px;">
        <span style="color:#fff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">פרטי המשרה</span>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 20px;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#000;">${data.jobTitle}</p>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0"
         style="border:1px solid #e0e0e0;margin-bottom:24px;">
    <tr>
      <td style="background:#f8f8f8;padding:12px 20px;border-bottom:1px solid #e0e0e0;">
        <span style="color:#333;font-size:13px;font-weight:700;">פרטי המועמד/ת</span>
      </td>
    </tr>
    <tr>
      <td style="padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:12px 20px;font-size:13px;color:#888;width:100px;">שם מלא</td>
            <td style="padding:12px 20px;font-size:14px;color:#000;font-weight:600;">${data.fullName}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:12px 20px;font-size:13px;color:#888;">טלפון</td>
            <td style="padding:12px 20px;font-size:14px;color:#000;">
              <a href="tel:${data.phone}" style="color:#0058a3;text-decoration:none;">${data.phone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 20px;font-size:13px;color:#888;">אימייל</td>
            <td style="padding:12px 20px;font-size:14px;color:#000;">
              <a href="mailto:${data.email}" style="color:#0058a3;text-decoration:none;">${data.email}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`);

const sendActiveTrailEmail = async (data, isForCandidate = false) => {
    const recipient = isForCandidate ? data.email : process.env.RECIPIENT_EMAIL;
    
    const subject = isForCandidate 
        ? `אישור הגשת מועמדות - IKEA` 
        : `מועמדות חדשה למשרה: ${data.jobTitle}`; 

    const body = isForCandidate
        ? candidateEmailHtml(data)
        : recruiterEmailHtml(data);

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