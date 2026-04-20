const nodemailer = require('nodemailer');

/**
 * Creates and configures a Nodemailer transporter
 * 
 * @returns {Promise<nodemailer.Transporter>} Configured email transporter
 */
const createTransporter = async () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Sends a job application email to the recruiter with CV attachment
 */
const sendRecruiterEmail = async (data, cvFile) => {
    const transporter = await createTransporter();
    
    const job = data.job;
    const jobTitle = job?.description || "משרה כללית";
    const recruiterEmail = process.env.RECIPIENT_EMAIL;

    const mailOptions = {
        from: `"IKEA Jobs System" <${process.env.EMAIL_USER}>`,
        to: recruiterEmail,
        subject: `מועמדות חדשה למשרה: ${jobTitle}`,
        html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px;">
                <h2 style="color: #0058a3; border-bottom: 3px solid #ffdb00; padding-bottom: 10px;">התקבלה פנייה חדשה למשרה</h2>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #0058a3; margin-top: 0;">📋 פרטי המשרה:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; font-weight: bold; width: 180px;">תיאור המשרה:</td>
                            <td style="padding: 8px;">${job?.description || '-'}</td>
                        </tr>
                        <tr style="background-color: #fff;">
                            <td style="padding: 8px; font-weight: bold;">מספר משרה:</td>
                            <td style="padding: 8px;">${job?.order_id || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">סניף:</td>
                            <td style="padding: 8px;">${job?.name_snif || '-'}</td>
                        </tr>
                        <tr style="background-color: #fff;">
                            <td style="padding: 8px; font-weight: bold;">איזור עבודה:</td>
                            <td style="padding: 8px;">${job?.work_area || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">תחום מקצועי:</td>
                            <td style="padding: 8px;">${job?.profession_name || '-'}</td>
                        </tr>
                        <tr style="background-color: #fff;">
                            <td style="padding: 8px; font-weight: bold;">תאריך סגירה:</td>
                            <td style="padding: 8px;">${job?.closeDate_ddmmyyy || '-'}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-right: 4px solid #ffdb00; margin: 20px 0;">
                    <h3 style="color: #0058a3; margin-top: 0;">👤 פרטי המועמד/ת:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; font-weight: bold; width: 180px;">שם מלא:</td>
                            <td style="padding: 8px; font-size: 16px;"><strong>${data.fullName}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">טלפון:</td>
                            <td style="padding: 8px;"><a href="tel:${data.phone}" style="color: #0058a3;">${data.phone}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">אימייל:</td>
                            <td style="padding: 8px;"><a href="mailto:${data.email}" style="color: #0058a3;">${data.email}</a></td>
                        </tr>
                    </table>
                </div>
                
                ${cvFile ? `
                <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; border-right: 4px solid #28a745; margin: 20px 0;">
                    <p style="margin: 0;"><strong>📎 קובץ CV מצורף:</strong> ${cvFile.originalname}</p>
                </div>
                ` : `
                <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; border-right: 4px solid #dc3545; margin: 20px 0;">
                    <p style="margin: 0; color: #721c24;"><strong>⚠️ לא צורף קובץ CV</strong></p>
                </div>
                `}
                
                ${job?.notes_text ? `
                <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #0058a3; margin-top: 0;">📄 תיאור המשרה:</h3>
                    <div style="white-space: pre-wrap; line-height: 1.8;">${job.notes_text.substring(0, 1000)}${job.notes_text.length > 1000 ? '...' : ''}</div>
                </div>
                ` : ''}
                
                <hr style="margin-top: 30px; border: none; border-top: 2px solid #ddd;">
                <p style="font-size: 12px; color: #888; text-align: center;">
                    נשלח ממערכת IKEA Jobs • ${new Date().toLocaleDateString('he-IL')}
                </p>
            </div>
        `,
        attachments: cvFile ? [{
            filename: cvFile.originalname,
            content: cvFile.buffer,
            contentType: cvFile.mimetype
        }] : []
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(' Recruiter email sent! ID:', result.messageId);
    return result;
};

/**
 * Sends a confirmation email to the candidate
 */
const sendCandidateEmail = async (data) => {
    const transporter = await createTransporter();
    
    const job = data.job;
    const jobTitle = job?.description || "משרה כללית";
    
    console.log('Sending confirmation to candidate:', data.email);

    const mailOptions = {
        from: `"IKEA Jobs" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: `אישור הגשת מועמדות - IKEA`,
        html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #0058a3; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">IKEA Jobs</h1>
                </div>
                
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #0058a3;">שלום ${data.fullName},</h2>
                    
                    <p style="font-size: 16px;">תודה רבה על הגשת מועמדותך למשרה:</p>
                    
                    <div style="background-color: white; padding: 20px; border-right: 4px solid #ffdb00; margin: 20px 0;">
                        <h3 style="color: #0058a3; margin-top: 0;">📋 ${jobTitle}</h3>
                        ${job?.name_snif ? `<p style="margin: 5px 0;"><strong>סניף:</strong> ${job.name_snif}</p>` : ''}
                        ${job?.work_area ? `<p style="margin: 5px 0;"><strong>איזור:</strong> ${job.work_area}</p>` : ''}
                    </div>
                    
                    <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #155724;"> <strong>הבקשה שלך התקבלה בהצלחה!</strong></p>
                    </div>
                    
                    <p style="font-size: 15px;">
                        הפרטים שלך נקלטו במערכת ונבדקים על ידי צוות הגיוס.<br>
                        במידה ותימצא התאמה, נציג מטעמנו יצור איתך קשר.
                    </p>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">
                        בברכה,<br><strong style="color: #0058a3;">צוות IKEA</strong>
                    </p>
                </div>
                
                <div style="background-color: #0058a3; padding: 15px; text-align: center;">
                    <p style="color: white; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} IKEA</p>
                </div>
            </div>
        `
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
};

module.exports = {
    sendRecruiterEmail,
    sendCandidateEmail
};
