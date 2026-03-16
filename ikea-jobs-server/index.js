
const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');


const app = express();
app.use(cors());
app.use(express.json());

// הגדרת multer לשמירת קבצים בתיקיית uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        // שם ייחודי לכל קובץ
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// שרת קבצים סטטי להורדה
// זה מוודא שהשרת יודע בדיוק איפה תיקיית ה-uploads נמצאת
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// הגדרות אקטיב טרייל
const ACTIVE_TRAIL_TOKEN = '0XE74184A0DBDA62ED2774F331655FC2F06EDE3D2C74BDDFA731A07BFF52690FD773350E6AC8AFCFEB9785E8001BB638AA';
const RECIPIENT_EMAIL = 'sarah@daatsolutions.co.il';


app.post('/api/send-application', upload.single('cvFile'), async (req, res) => {
  console.log('File received:', req.file); // <--- תוסיפי את זה כאן
    console.log('Body received:', req.body);
  try {
        // שדות טקסטואלים מגיעים ב-body, קובץ ב-file
        const { job, fullName, email, phone } = req.body;
        let jobObj = job;
        // אם job הגיע כ-stringified JSON
        if (typeof job === 'string') {
          jobObj = JSON.parse(job);
        }

        // קישור לקובץ אם קיים
        let cvFileUrl = null;
        if (req.file) {
          cvFileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        // בניית המבנה (Payload) בדיוק לפי ה-Sample שקיבלת מהתמיכה
        const payload = {
            "email_package": [
                {
                    "email": RECIPIENT_EMAIL,
                    "pairs": [
                        { "key": "fullName", "value": fullName },
                        { "key": "email", "value": email },
                        { "key": "phone", "value": phone },
                        { "key": "jobTitle", "value": jobObj.description },
                        cvFileUrl ? { "key": "cvFileUrl", "value": cvFileUrl } : null
                    ].filter(Boolean)
                }
            ],
            "details": {
                "name": `Application from ${fullName}`,
                "subject": `מועמדות למשרה: ${jobObj.description}`,
                "user_profile_id": 39331,
                "classification": "Operational",
                "user_profile_fromname": "מערכת בדיקות"
            },
            "design": {
                "content": `
                    <div dir="rtl" style="font-family: Arial;">
                        <h2>התקבלה מועמדות חדשה</h2>
                        <p><strong>שם:</strong> ${fullName}</p>
                        <p><strong>אימייל:</strong> ${email}</p>
                        <p><strong>טלפון:</strong> ${phone}</p>
                        <p><strong>משרה:</strong> ${jobObj.description}</p>
                      <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
            <strong>קורות חיים:</strong><br>
            ${cvFileUrl 
                ? `<a href="${cvFileUrl}" target="_blank" style="background: #0058a3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">לחץ כאן לצפייה בקורות חיים</a>
                   <p style="font-size: 12px; color: #666;">או העתק את הקישור: ${cvFileUrl}</p>`
                : '<span style="color: red;">לא צורף קובץ</span>'
            }
        </div>
                    </div>`,
                "language_type": "UTF-8",
                "body_part_format": 2,
                "add_print_button": true,
                "add_Statistics": true
            }
        };

        const response = await fetch('https://webapi.mymarketing.co.il/api/OperationalMessage/Message', {
            method: 'POST',
            headers: {
                'Authorization': ACTIVE_TRAIL_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('ActiveTrail Error Response:', result);
            return res.status(response.status).json({ success: false, error: result });
        }

        console.log('Email sent successfully:', result);
        res.json({ success: true, data: result });

    } catch (error) {
        console.error('Fatal Server Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Node.js server is running on http://localhost:${PORT}`);
});