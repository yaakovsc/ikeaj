const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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
        <tr>
          <td style="background:#0058a3;padding:20px 32px;">
            <span style="color:#FFDA1A;font-size:28px;font-weight:900;letter-spacing:2px;">IKEA</span>
            <span style="color:#fff;font-size:14px;margin-right:16px;vertical-align:middle;">משרות | Careers</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;">
            ${content}
          </td>
        </tr>
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

  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;margin-bottom:28px;">
    <tr>
      <td style="background:#0058a3;padding:12px 20px;">
        <span style="color:#fff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">פרטי המשרה</span>
      </td>
    </tr>
    <tr>
      <td style="padding:20px;">
        <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#000;">${data.jobTitle}</p>
        ${data.jobBranch ? `<p style="margin:0;font-size:14px;color:#555;">${data.jobBranch}</p>` : ''}
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;margin-bottom:28px;">
    <tr>
      <td style="background:#f8f8f8;padding:12px 20px;border-bottom:1px solid #e0e0e0;">
        <span style="color:#333;font-size:13px;font-weight:700;">מה קורה עכשיו?</span>
      </td>
    </tr>
    <tr>
      <td style="padding:20px;">
        <table cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;color:#555;font-size:14px;line-height:1.6;"><span style="color:#0058a3;font-weight:700;margin-left:8px;">1.</span> המועמדות שלך נקלטה במערכת הגיוס שלנו.</td></tr>
          <tr><td style="padding:6px 0;color:#555;font-size:14px;line-height:1.6;"><span style="color:#0058a3;font-weight:700;margin-left:8px;">2.</span> צוות הגיוס יבחן את הפרופיל שלך.</td></tr>
          <tr><td style="padding:6px 0;color:#555;font-size:14px;line-height:1.6;"><span style="color:#0058a3;font-weight:700;margin-left:8px;">3.</span> במידה ותימצא התאמה, נציג/ה מטעמנו יצור/תיצור איתך קשר.</td></tr>
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

  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;margin-bottom:24px;">
    <tr>
      <td style="background:#0058a3;padding:12px 20px;">
        <span style="color:#fff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">פרטי המשרה</span>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#000;">${data.jobTitle}</p>
        ${data.jobBranch ? `<p style="margin:0;font-size:14px;color:#555;">${data.jobBranch}${data.jobDomain ? ' · ' + data.jobDomain : ''}</p>` : ''}
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;margin-bottom:24px;">
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

const sendCandidateEmail = async (data) => {
    await transporter.sendMail({
        from: `"IKEA Jobs" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: `אישור הגשת מועמדות - IKEA`,
        html: candidateEmailHtml(data),
    });
};

const sendRecruiterEmail = async (data, cvFile) => {
    const mailOptions = {
        from: `"IKEA Jobs" <${process.env.EMAIL_USER}>`,
        to: process.env.RECIPIENT_EMAIL,
        subject: `מועמדות חדשה למשרה: ${data.jobTitle}`,
        html: recruiterEmailHtml(data),
    };

    if (cvFile) {
        mailOptions.attachments = [{
            filename: cvFile.originalname,
            content: cvFile.buffer,
            contentType: cvFile.mimetype,
        }];
    }

    await transporter.sendMail(mailOptions);
};

module.exports = { sendCandidateEmail, sendRecruiterEmail };
