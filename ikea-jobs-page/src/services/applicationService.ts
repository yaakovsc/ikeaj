import { Job } from '../types';

interface ApplicationData {
  fullName: string;
  email: string;
  phone: string;
  cvFile?: FileList;
}

interface SendApplicationResult {
  success: boolean;
  error?: any;
}

const SERVER_URL = process.env.REACT_APP_JOBS_SERVER_URL || 'http://localhost:3001';

export const sendJobApplication = async (
  job: Job,
  applicationData: ApplicationData
): Promise<SendApplicationResult> => {
  try {
    const form = new FormData();
    form.append('fullName', applicationData.fullName);
    form.append('email',    applicationData.email);
    form.append('phone',    applicationData.phone);
    form.append('job',      JSON.stringify(job));

    const cvFile = applicationData.cvFile?.[0];
    if (cvFile) {
      form.append('cvFile', cvFile, cvFile.name);
    }

    const response = await fetch(`${SERVER_URL}/api/send-application`, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: 'שגיאת רשת - אנא נסה שוב' };
  }
};