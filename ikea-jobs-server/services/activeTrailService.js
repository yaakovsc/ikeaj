const fetch = require('node-fetch');

const sendActiveTrailEmail = async (data) => {
    const htmlContent = `
        <div dir="rtl" style="font-family: Arial, sans-serif; border: 1px solid #0058a3; padding: 20px; max-width: 600px;">
            <h2 style="color: #0058a3;">התקבלה מועמדות חדשה - IKEA</h2>
            <hr />
            <p><strong>שם מועמד:</strong> ${data.fullName}</p>
            <p><strong>טלפון:</strong> ${data.phone}</p>
            <p><strong>מייל:</strong> ${data.email}</p>
            <p><strong>משרה:</strong> ${data.jobTitle}</p>
            ${data.cvFileUrl ? `
                <div style="margin-top: 20px; padding: 10px; background: #f4f4f4;">
                    <a href="${data.cvFileUrl}" style="background: #0058a3; color: white; padding: 10px; text-decoration: none; border-radius: 5px;">צפה בקורות חיים</a>
                </div>
            ` : '<p>לא צורף קובץ</p>'}
        </div>
    `.replace(/\n/g, '').replace(/\s+/g, ' ');

    const payload = {
        email_package: [{
            email: process.env.RECIPIENT_EMAIL,
            pairs: [{ key: "fullName", value: data.fullName }]
        }],
        details: {
            name: `Recruitment - ${data.fullName}`,
            subject: `מועמדות למשרה: ${data.jobTitle}`,
            user_profile_id: parseInt(process.env.USER_PROFILE_ID),
            classification: "Operational",
            user_profile_fromname: "IKEA Jobs"
        },
        design: {
            content: htmlContent,
            language_type: "UTF-8",
            body_part_format: 2
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
        const err = await response.json();
        throw new Error(`ActiveTrail API Error: ${JSON.stringify(err)}`);
    }

    return await response.json();
};

module.exports = { sendActiveTrailEmail };