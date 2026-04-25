import { Job } from '../types';

/**
 * Data structure for job application submission
 */
interface ApplicationData {
  /** Applicant's full name */
  fullName: string;
  /** Applicant's email address */
  email: string;
  /** Applicant's phone number */
  phone: string;
  /** Optional CV file (not sent to server, only for form validation) */
  cvFile?: FileList;
}

/**
 * Result object returned from application submission
 */
interface SendApplicationResult {
  /** Whether the application was sent successfully */
  success: boolean;
  /** Error details if submission failed */
  error?: any;
}

/**
 * Sends a job application to the backend server via ActiveTrail API
 * 
 * This function:
 * - Sends application data to the backend server
 * - Backend forwards two emails via ActiveTrail: one to recruiter, one to candidate
 * - Handles network errors and server errors gracefully
 * - Does NOT send CV file (ActiveTrail doesn't support attachments)
 * 
 * The backend server must be running on http://localhost:3001
 * 
 * @param {Job} job - The job posting being applied to
 * @param {ApplicationData} applicationData - Applicant's information
 * @returns {Promise<SendApplicationResult>} Object with success status and optional error
 * 
 * @example
 * ```typescript
 * const result = await sendJobApplication(
 *   job,
 *   {
 *     fullName: "ישראל ישראלי",
 *     email: "israel@example.com",
 *     phone: "050-1234567"
 *   }
 * );
 * 
 * if (result.success) {
 *   console.log("הבקשה נשלחה בהצלחה!");
 * } else {
 *   console.error("שגיאה:", result.error);
 * }
 * ```
 */
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

    const response = await fetch('http://localhost:3001/api/send-application', {
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