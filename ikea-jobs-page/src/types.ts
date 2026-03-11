export interface Job {
  order_id: number;          // מזהה ייחודי של המשרה
  order_snif: number;        // מספר סניף
  description: string;       // שם המשרה
  name_snif: string;         // שם הסניף / חנות
  profession_name: string;   // שם התחום (למשל: בטיחות)
  tat_profession_name?: string; // שם המשרה המלא (למשל: 1084 - ממונה בטיחות בעבודה)
  order_def_prof_name1: string; // שם התחום כפי שמופיע בסינון
  work_area: string;         // אזור עבודה (למשל: ירושלים ויו"ש)
  update_date: string;       // תאריך עדכון למיון (ISO)
  updateDate_ddmmyyyy: string; // תאריך עדכון לתצוגה
  close_date: string;        // תאריך סגירה
  closeDate_ddmmyyy: string; // תאריך סגירה לתצוגה
  notes: string;             // HTML של תיאור המשרה
  notes_text: string;        // טקסט נקי של תיאור המשרה
  email_rakaz: string;       // אימייל רכז
  living_area1: string | null;
  living_area2: string | null;
}