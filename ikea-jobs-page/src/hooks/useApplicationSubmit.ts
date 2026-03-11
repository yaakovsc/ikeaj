import { useState, useCallback } from 'react';
import { Job } from '../types';
import { sendApplicationToAdam, sendBackupEmail } from '../services/emailService';

interface ApplicationData {
  fullName: string;
  email: string;
  phone: string;
  cvFile: FileList;
}

export const useApplicationSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitApplication = useCallback(async (job: Job, data: ApplicationData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const applicationData = {
        jobId: job.order_id,
        jobTitle: job.description,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        cvFile: data.cvFile?.[0]
      };

      // שליחה למערכת אדם
      await sendApplicationToAdam(applicationData);

      // שליחת מייל גיבוי
      await sendBackupEmail(applicationData);

      // שמירת פרטי המועמד ב-localStorage (ללא הקובץ)
      localStorage.setItem('applicantData', JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone
      }));

      setSuccess(true);

      // איפוס הצלחה אחרי 5 שניות
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (err) {
      console.error('שגיאה בשליחת המועמדות:', err);
      setError('אירעה שגיאה בשליחת המועמדות. אנא נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    submitApplication,
    isSubmitting,
    success,
    error
  };
};
