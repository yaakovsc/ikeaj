# IKEA Email Service

שירות עצמאי לשליחת מיילים עם קבצים מצורפים - **ללא תלות ב-ActiveTrail**

## מה זה עושה?

✅ מקבל מועמדות למשרה מה-Frontend  
✅ שולח מייל אישור למועמד  
✅ שולח מייל מפורט לרכז גיוס עם קובץ CV מצורף  
✅ תומך ב-PDF, DOC, DOCX עד 5MB

## התקנה

```bash
npm install
```

## הגדרת .env

ערוך את קובץ `.env` והזן את פרטי ה-SMTP שלך:

```env
PORT=3002
RECIPIENT_EMAIL=sarah@daatsolutions.co.il
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sarah@daatsolutions.co.il
EMAIL_PASS=your-app-password
```

## הרצה

```bash
node index.js
```

השרת ירוץ על: `http://localhost:3002`

## API

### POST /api/send-application

**Headers:**  
`Content-Type: multipart/form-data`

**Body (Form Data):**

- `fullName` - שם מלא
- `email` - אימייל המועמד
- `phone` - טלפון
- `job` - אובייקט JSON של המשרה (stringified)
- `cvFile` - קובץ CV (אופציונלי)

**Response:**

```json
{
  "success": true,
  "message": "Emails sent successfully"
}
```

## עדכון Frontend

שנה את ה-URL ב-`activeTrailService.ts`:

```typescript
const response = await fetch("http://localhost:3002/api/send-application", {
  method: "POST",
  body: formData,
});
```

## מבנה הפרויקט

```
ikea-email-service/
├── index.js                    # שרת Express ראשי
├── routes.js                   # Routes + Multer
├── applicationController.js    # Logic של טיפול במועמדות
├── emailService.js            # שליחת מיילים עם Nodemailer
├── .env                       # הגדרות SMTP
├── package.json
└── README.md
```

---

**הכל עובד עצמאית! אין תלות ב-ActiveTrail כלל.** 🎉

## 📄 מנגנון שליפת משרות וקאשינג

### 📌 תיאור כללי

המערכת מושכת משרות מ־API חיצוני (אדם) ושומרת אותן כקובץ JSON מקומי בשרת, במטרה לשפר ביצועים ולשמור על זמינות גם במקרה של תקלות תקשורת.

---

### ⚙️ איך זה עובד

כאשר מתבצעת בקשה לנתוני משרות:

`GET /api/fetch-jobs`

השרת בודק:

- מתי בוצעה הקריאה האחרונה ל־API
- האם קיים קובץ נתונים מקומי

ובהתאם מחליט:

- להביא נתונים חדשים מה־API
- או להחזיר נתונים מהקובץ המקומי (cache)

---

### 🧠 לוגיקת קאשינג

- זמן הקריאה האחרונה נשמר בקובץ:  
  `last_fetch.txt`

- זמן הריענון (בדקות) מוגדר בקובץ:  
  `config.json`

דוגמה:

```
{
  "refreshMinutes": 30
}
```

- נתוני המשרות נשמרים בקובץ:  
  `adam_all_orders_json.json`

---

### 🔄 זרימת עבודה

#### בקשה ראשונה

- אין קובץ JSON
- מתבצעת קריאה ל־API
- הנתונים נשמרים בקובץ
- נשמר זמן הקריאה

#### בקשות הבאות

- אם לא עבר זמן הריענון → מוחזר cache
- אם עבר זמן הריענון → מתבצעת קריאה חדשה ל־API

---

### 🛡️ התנהגות במקרה של תקלה

- אם קריאת ה־API נכשלת:
  - המערכת תחזיר נתונים מהקובץ המקומי (אם קיים)
- אם אין קובץ מקומי:
  - תוחזר שגיאת שרת (500)

---

### 🚀 יתרונות

- הפחתת כמות קריאות ל־API
- שיפור ביצועים למשתמשים
- זמינות נתונים גם במקרה של נפילת API חיצוני
- מניעת עומס על הדפדפן

---

### 📁 מבנה קבצים

```
src/
 ├── assets/
 │    ├── adam_all_orders_json.json
 │    ├── last_fetch.txt
 │
 ├── services/
 │    └── adam.service.js
 │
config.json
```

---

### ⚠️ הערות

- המערכת מטפלת במקרים של:
  - קבצים חסרים
  - JSON ריק או פגום
  - כשל בקריאת API
- במקרה שאין `config.json`, נעשה שימוש בערך ברירת מחדל
