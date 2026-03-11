// שירות מזויף לשליחת מיילים - לצורך פיתוח
// בעתיד יש להחליף בשירות אמיתי (API למערכת אדם)

export interface ApplicationData {
  jobId: number;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  cvFile?: File;
}

export const sendApplicationToAdam = async (data: ApplicationData): Promise<boolean> => {
  // סימולציה של שליחה למערכת אדם
  console.log('📤 שליחה למערכת אדם:', {
    jobId: data.jobId,
    jobTitle: data.jobTitle,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    cvFileName: data.cvFile?.name
  });

  // סימולציה של זמן תגובה
  await new Promise(resolve => setTimeout(resolve, 1000));

  // מחזיר הצלחה (בעתיד יחזיר תשובה אמיתית מהשרת)
  return true;
};

export const sendBackupEmail = async (data: ApplicationData): Promise<boolean> => {
  // סימולציה של שליחת מייל גיבוי
  console.log('📧 שליחת מייל גיבוי:', {
    to: 'backup@company.com',
    subject: `מועמדות חדשה: ${data.jobTitle}`,
    body: `
      מועמד חדש הגיש מועמדות:
      
      שם: ${data.fullName}
      אימייל: ${data.email}
      טלפון: ${data.phone}
      משרה: ${data.jobTitle} (ID: ${data.jobId})
      קובץ CV: ${data.cvFile?.name || 'לא צורף'}
    `
  });

  // סימולציה של זמן תגובה
  await new Promise(resolve => setTimeout(resolve, 500));

  return true;
};
