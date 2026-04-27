#!/usr/bin/env node
/**
 * Seed script — generates N realistic IKEA Israel test job postings.
 * Usage:  node seed-jobs.js [N]
 * Default N = 15
 *
 * Writes to:  src/assets/adam_all_orders_json.json
 * Resets:     last_fetch.txt  (so the server serves the seed data, not the live API)
 */

const fs = require('fs');
const path = require('path');

const N = parseInt(process.argv[2]) || 15;

const JSON_FILE   = path.join(__dirname, 'src/assets/adam_all_orders_json.json');
const LAST_FETCH  = path.join(__dirname, 'last_fetch.txt');
const CONFIG_FILE = path.join(__dirname, 'config.json');

// ─── Data pools ──────────────────────────────────────────────────────────────

const branches = [
  { name: 'IKEA נתניה',         snif: 101, area: 'מרכז' },
  { name: 'IKEA ראשון לציון',   snif: 102, area: 'מרכז' },
  { name: 'IKEA ירושלים',       snif: 103, area: 'ירושלים' },
  { name: 'IKEA קריות',         snif: 104, area: 'צפון' },
  { name: 'IKEA באר שבע',       snif: 105, area: 'דרום' },
  { name: 'IKEA פתח תקווה',     snif: 106, area: 'מרכז' },
];

const domains = [
  {
    name: 'מכירות',
    titles: ['עוזר/ת מכירות', 'יועץ/ת מכירות', 'מנהל/ת מכירות'],
    notes: (title, branch) => `
<p>אנחנו מחפשים <strong>${title}</strong> לסניף <strong>${branch}</strong> שיצטרף לצוות המכירות שלנו.</p>
<ul>
  <li>ייעוץ והכוונת לקוחות בהתאמת מוצרים לבית</li>
  <li>עמידה ביעדי מכירות ושביעות רצון לקוח</li>
  <li>שמירה על סדר ומצגת מוצרים בתצוגה</li>
  <li>עבודה בסביבה דינמית ומהנה</li>
</ul>
<p><strong>דרישות:</strong> ניסיון במכירות – יתרון, עברית שוטפת, זמינות לעבודה בסופי שבוע.</p>
<p><strong>היקף משרה:</strong> משרה מלאה / חלקית לפי הסכמה.</p>
`.trim(),
  },
  {
    name: 'לוגיסטיקה ומחסן',
    titles: ['עובד/ת מחסן', 'מנהל/ת מחסן', 'אחראי/ת לוגיסטיקה'],
    notes: (title, branch) => `
<p>דרוש/ה <strong>${title}</strong> לסניף <strong>${branch}</strong> לניהול זרם הסחורה.</p>
<ul>
  <li>קבלת סחורה, ספירה ואחסון במחסן</li>
  <li>עבודה עם מלגזה ומערכות מחשב (הכשרה ניתנת)</li>
  <li>תיאום עם מחלקות המכירות לאספקת מוצרים</li>
  <li>שמירה על סדר ובטיחות במחסן</li>
</ul>
<p><strong>דרישות:</strong> כושר גופני, נכונות לעבודה בשעות בוקר מוקדמות, רישיון מלגזה – יתרון.</p>
`.trim(),
  },
  {
    name: 'קופה ושירות לקוחות',
    titles: ['קופאי/ת', 'נציג/ת שירות לקוחות', 'מנהל/ת נקודת שירות'],
    notes: (title, branch) => `
<p>מחפשים <strong>${title}</strong> מחייך/ת ואכפתי/ת לסניף <strong>${branch}</strong>.</p>
<ul>
  <li>מתן שירות אדיב ויעיל ללקוחות</li>
  <li>טיפול בתשלומים, החזרות ופניות לקוח</li>
  <li>פתרון בעיות ושמירה על חווית לקוח גבוהה</li>
  <li>עבודה מול קופה ומערכת CRM</li>
</ul>
<p><strong>דרישות:</strong> אוריינטציה שירותית, סבלנות, ניסיון בשירות לקוחות – יתרון.</p>
`.trim(),
  },
  {
    name: 'עיצוב ואינטריאור',
    titles: ['מדריך/ת עיצוב פנים', 'יועץ/ת עיצוב', 'מנהל/ת מחלקת עיצוב'],
    notes: (title, branch) => `
<p>הצטרף/י לצוות העיצוב שלנו בסניף <strong>${branch}</strong> כ<strong>${title}</strong>.</p>
<ul>
  <li>ייעוץ ותכנון עיצוב לחדרים שלמים עם לקוחות</li>
  <li>שימוש בתוכנות תכנון דיגיטליות של IKEA</li>
  <li>הצגת פתרונות אחסון, תאורה וריהוט</li>
  <li>בניית מערכות תצוגה בחנות</li>
</ul>
<p><strong>דרישות:</strong> רקע בעיצוב פנים / אדריכלות – יתרון, יחסי אנוש מעולים, יצירתיות.</p>
`.trim(),
  },
  {
    name: 'מסעדה ומזון',
    titles: ['עובד/ת מסעדה', 'מלצר/ית', 'טבח/ית', 'מנהל/ת מסעדה'],
    notes: (title, branch) => `
<p>מסעדת IKEA <strong>${branch}</strong> מגייסת <strong>${title}</strong> לצוות המזון שלנו.</p>
<ul>
  <li>הגשת מנות ושמירה על סטנדרט איכות המזון של IKEA</li>
  <li>שמירה על ניקיון והיגיינה בסביבת העבודה</li>
  <li>שירות לקוחות ידידותי בסביבת מסעדה</li>
  <li>עבודה בצוות בסביבה תוססת ומהנה</li>
</ul>
<p><strong>דרישות:</strong> ניסיון בתחום המזון – יתרון, תעודת בריאות בתוקף, זמינות לסופי שבוע.</p>
`.trim(),
  },
  {
    name: 'ניהול',
    titles: ['סגן/ית מנהל חנות', 'מנהל/ת מחלקה', 'מנהל/ת תורנות'],
    notes: (title, branch) => `
<p>דרוש/ה <strong>${title}</strong> מנוסה לסניף <strong>${branch}</strong> שיוביל/תוביל את הצוות לתוצאות.</p>
<ul>
  <li>ניהול יומיומי של הצוות ותפעול הסניף / המחלקה</li>
  <li>אחריות על יעדי מכירות, רמת שירות ועמידה בלוחות זמנים</li>
  <li>גיוס, הכשרה ופיתוח עובדים</li>
  <li>ניתוח נתונים וקבלת החלטות</li>
</ul>
<p><strong>דרישות:</strong> לפחות 3 שנות ניסיון ניהולי, יכולת הובלה, אוריינטציה לתוצאות.</p>
`.trim(),
  },
  {
    name: 'תחזוקה',
    titles: ['טכנאי/ת תחזוקה', 'אחראי/ת תחזוקה'],
    notes: (title, branch) => `
<p>מחפשים <strong>${title}</strong> מיומן/ת לסניף <strong>${branch}</strong>.</p>
<ul>
  <li>תחזוקה שוטפת של מערכות חשמל, אינסטלציה ומיזוג</li>
  <li>תיקון ותחזוקה של ציוד החנות</li>
  <li>ביצוע בדיקות בטיחות תקופתיות</li>
  <li>תיאום עם ספקי שירות חיצוניים</li>
</ul>
<p><strong>דרישות:</strong> ניסיון בתחזוקה תעשייתית / מסחרית, רישיון חשמלאי – יתרון, נכונות לזמינות גבוהה.</p>
`.trim(),
  },
  {
    name: 'משאבי אנוש',
    titles: ['מגייס/ת', 'מנהל/ת HR'],
    notes: (title, branch) => `
<p>לסניף <strong>${branch}</strong> דרוש/ה <strong>${title}</strong> שיעזור/תעזור לנו למצוא את הכישרונות הבאים.</p>
<ul>
  <li>ניהול תהליכי גיוס מקצה לקצה</li>
  <li>ריאיון מועמדים והערכת התאמה</li>
  <li>עבודה מול מנהלים ומועמדים בו-זמנית</li>
  <li>שימוש בפלטפורמות גיוס דיגיטליות</li>
</ul>
<p><strong>דרישות:</strong> ניסיון בגיוס, כישורי תקשורת בין-אישית מעולים, עברית ואנגלית שוטפות.</p>
`.trim(),
  },
];

const livingAreas = [
  'תל אביב', 'חיפה', 'ירושלים', 'באר שבע',
  'נתניה', 'ראשון לציון', 'פתח תקווה', 'אשדוד', 'רמת גן', null,
];

const rakazEmails = [
  'jobs.il@ikea.com',
  'hr.natanya@ikea.com',
  'hr.rishon@ikea.com',
  'hr.jerusalem@ikea.com',
  'hr.north@ikea.com',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDDMMYYYY(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function toISO(date) {
  return date.toISOString().split('T')[0];
}

// ─── Job generator ────────────────────────────────────────────────────────────

function generateJob(index) {
  const branch  = pick(branches);
  const domain  = pick(domains);
  const title   = pick(domain.titles);
  const orderId = String(1000 + index).padStart(5, '0');

  const today     = new Date();
  const startDate = addDays(today, -(Math.floor(Math.random() * 60)));   // posted 0–60 days ago
  const closeDate = addDays(today,  14 + Math.floor(Math.random() * 60)); // closes in 14–74 days

  const notesHtml = domain.notes(title, branch.name);
  const notesText = notesHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  const living1 = pick(livingAreas);
  const living2 = Math.random() > 0.6
    ? pick(livingAreas.filter(l => l && l !== living1))
    : null;

  return {
    order_id:               5000 + index,
    order_snif:             branch.snif,
    description:            title,
    name_snif:              branch.name,
    profession_name:        domain.name,
    tat_profession_name:    `${title} (${orderId})`,
    order_def_prof_name1:   domain.name,
    work_area:              branch.area,
    update_date:            toISO(startDate),
    updateDate_ddmmyyyy:    toDDMMYYYY(startDate),
    start_advertising_date: toDDMMYYYY(startDate),   // used by sortJobsByDate
    close_date:             toISO(closeDate),
    closeDate_ddmmyyy:      toDDMMYYYY(closeDate),
    notes:                  notesHtml,
    notes_text:             notesText,
    email_rakaz:            pick(rakazEmails),
    living_area1:           living1,
    living_area2:           living2,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const jobs = Array.from({ length: N }, (_, i) => generateJob(i + 1));

fs.writeFileSync(JSON_FILE,  JSON.stringify(jobs, null, 2), 'utf8');
fs.writeFileSync(LAST_FETCH, new Date().toISOString(),      'utf8');

const configRefresh = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')).refreshMinutes ?? 30;

console.log(`\nGenerated ${N} test jobs`);
console.log(`  File:     ${JSON_FILE}`);
console.log(`  Branches: ${[...new Set(jobs.map(j => j.name_snif))].join(', ')}`);
console.log(`  Domains:  ${[...new Set(jobs.map(j => j.order_def_prof_name1))].join(', ')}`);
console.log(`\n  last_fetch.txt updated — server will serve this cache for ${configRefresh} min without hitting ADAM API.\n`);
