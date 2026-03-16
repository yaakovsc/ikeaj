# IKEA Jobs Server - תיעוד Backend

שרת Node.js + Express המטפל בשליחת מועמדויות למשרות דרך ActiveTrail API.

---

## 📋 תוכן עניינים

- [סקירה כללית](#סקירה-כללית)
- [מבנה הפרויקט](#מבנה-הפרויקט)
- [התקנה והרצה](#התקנה-והרצה)
- [API Documentation](#api-documentation)
- [משתני סביבה](#משתני-סביבה)
- [ארכיטקטורה](#ארכיטקטורה)

---

## 🎯 סקירה כללית

השרת מספק API endpoint אחד שמקבל מועמדות למשרה ושולח 2 מיילים:
1. **מייל למועמד** - אישור קבלת המועמדות
2. **מייל למגייס** - פרטי המועמד והמשרה

---

## 📁 מבנה הפרויקט

```
ikea-jobs-server/
├── src/
│   ├── controllers/
│   │   └── applicationController.js    # בקר ראשי - מטפל בלוגיקה
│   ├── routes/
│   │   └── applicationRoutes.js        # הגדרת נתיבי API
│   ├── services/
│   │   └── activeTrailService.js       # שירות שליחת מיילים
│   └── index.js                        # נקודת כניסה - Express server
├── uploads/                            # תיקייה לקבצי CV (עתידי)
├── .env                                # משתני סביבה (לא ב-Git!)
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 התקנה והרצה

### 1. התקנת תלויות

cd ikea-jobs-server
npm install
```

### 2. הגדרת משתני סביבה

צור קובץ `.env` בתיקייה הראשית:

```env
PORT=3001
ACTIVE_TRAIL_TOKEN=0XE74184A0DBDA62ED2774F331655FC2F06EDE3D2C74BDDFA731A07BFF52690FD773350E6AC8AFCFEB9785E8001BB638AA
RECIPIENT_EMAIL=sarah@daatsolutions.co.il
USER_PROFILE_ID=39331
```

### 3. הרצת השרת

**מצב פיתוח:**
```bash
node src/index.js
```

**מצב production (עם nodemon):**
```bash
npm run dev
```

✅ **אמור להופיע:**
```
[dotenv] injecting env (4) from .env
Server running on port 3001
```

---

## 📡 API Documentation

### POST /api/send-application

שליחת מועמדות למשרה.

#### Request

**URL:** `http://localhost:3001/api/send-application`

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "job": {
    "description": "שם המשרה",
    "order_id": 12345,
    "name_snif": "שם החנות"
  },
  "fullName": "ישראל ישראלי",
  "email": "israel@example.com",
  "phone": "0501234567"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Emails sent successfully"
}
```

**Error (500):**
```json
{
  "success": false,
  "error": "Failed to send emails"
}
```

#### דוגמה לשימוש (cURL)

```bash
curl -X POST http://localhost:3001/api/send-application \
  -H "Content-Type: application/json" \
  -d '{
    "job": {"description": "מנהל מכירות"},
    "fullName": "ישראל כהן",
    "email": "israel@example.com",
    "phone": "0501234567"
  }'
```

---

## 🔐 משתני סביבה

| משתנה | תיאור | דוגמה |
|------|------|------|
| `PORT` | פורט השרת | `3001` |
| `ACTIVE_TRAIL_TOKEN` | טוקן API של ActiveTrail | `0X...` |
| `RECIPIENT_EMAIL` | מייל המגייס שיקבל את המועמדויות | `recruiter@ikea.com` |
| `USER_PROFILE_ID` | מזהה פרופיל ב-ActiveTrail | `39331` |

⚠️ **חשוב:** אל תשתף את הטוקן או תעלה אותו ל-Git!

---

## 🏗️ ארכיטקטורה

### Flow תהליך שליחת מועמדות

```
Frontend (React)
    ↓
    POST /api/send-application
    ↓
applicationRoutes.js
    ↓
applicationController.js
    ├─→ sendActiveTrailEmail(data, isForCandidate=false)  → Email למגייס
    └─→ sendActiveTrailEmail(data, isForCandidate=true)   → Email למועמד
    ↓
activeTrailService.js
    ↓
ActiveTrail API
    (https://webapi.mymarketing.co.il/api/OperationalMessage/Message)
```

### שכבות הפרויקט (Layers)

1. **index.js** - Express Server Setup
   - הגדרת CORS
   - טעינת משתני סביבה
   - הרצת השרת

2. **routes/** - API Routes
   - הגדרת endpoints
   - חיבור ל-controllers

3. **controllers/** - Business Logic
   - קבלת נתונים מה-request
   - קריאה ל-services
   - החזרת תשובה ל-client

4. **services/** - External Services
   - אינטגרציה עם ActiveTrail
   - בניית payload למיילים
   - שליחת בקשות HTTP

---

## 📧 ActiveTrail Integration

### מבנה ה-Payload

```javascript
{
  "email_package": [{
    "email": "recipient@example.com",
    "pairs": [
      { "key": "fullName", "value": "ישראל כהן" },
      { "key": "email", "value": "israel@example.com" },
      { "key": "phone", "value": "0501234567" },
      { "key": "jobTitle", "value": "מנהל מכירות" }
    ]
  }],
  "details": {
    "name": "IKEA_R_1234567890",
    "subject": "מועמדות למשרה: מנהל מכירות",
    "user_profile_id": 39331,
    "classification": "Operational",
    "user_profile_fromname": "IKEA Jobs"
  },
  "design": {
    "content": "תוכן המייל בטקסט רגיל...",
    "language_type": "UTF-8",
    "body_part_format": 1  // 1 = Plain Text, 2 = HTML
  }
}
```

### סוגי מיילים

#### 1. מייל למגייס (isForCandidate = false)
```
נושא: מועמדות חדשה למשרה: [שם המשרה]

התקבלה פנייה חדשה עבור המשרה:
[שם המשרה]

פרטי המועמד/ת:
--------------------------
שם מלא:  [שם]
טלפון:   [טלפון]
אימייל:  [מייל]

נשלח אוטומטית ממערכת הגיוס
```

#### 2. מייל למועמד (isForCandidate = true)
```
נושא: אישור הגשת מועמדות - IKEA

שלום [שם],

תודה על הגשת המועמדות למשרה:
[שם המשרה]

הפרטים התקבלו במערכת ונבדקים על ידי צוות הגיוס.
במידה ותימצא התאמה, נציג מטעמנו יצור איתך קשר.

בברכה,
צוות IKEA Jobs
```

---

## 🛠️ Troubleshooting

### בעיה: השרת לא עולה

**פתרון:**
1. בדוק שקובץ `.env` קיים ומכיל את כל המשתנים
2. ודא שהפורט 3001 פנוי:
   ```bash
   lsof -i :3001
   ```

### בעיה: "Failed to send email"

**פתרון:**
1. בדוק את הטוקן של ActiveTrail
2. ודא שיש חיבור לאינטרנט
3. בדוק ב-console את השגיאה המדויקת

### בעיה: CORS Error

**פתרון:**
- ודא ש-CORS מוגדר נכון ב-`index.js`:
```javascript
app.use(cors());
```

---

## 📦 Dependencies

```json
{
  "cors": "^2.8.6",           // CORS middleware
  "dotenv": "^17.3.1",        // Environment variables
  "express": "^5.2.1",        // Web framework
  "node-fetch": "^2.7.0"      // HTTP client
}
```

---


