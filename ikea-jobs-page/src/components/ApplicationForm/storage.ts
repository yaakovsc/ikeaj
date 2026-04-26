/**
 * localStorage key for storing application data
 * @constant
 */
const STORAGE_KEY = 'ikea_job_application_data';

/**
 * Stored application data interface
 */
interface StoredApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/**
 * Saves application data to localStorage
 * 
 * Persists user data (excluding CV file) for auto-fill on next application.
 * Handles errors gracefully and logs to console if storage fails.
 * 
 * @param data - Application data to save
 * 
 * @example
 * ```ts
 * saveApplicationData({
 *   fullName: 'ישראל ישראלי',
 *   email: 'israel@example.com',
 *   phone: '0501234567'
 * });
 * ```
 */
export const saveApplicationData = (data: StoredApplicationData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save application data:', error);
  }
};

/**
 * Loads application data from localStorage
 * 
 * Retrieves previously saved user data for auto-filling the form.
 * Returns null if no data exists or if parsing fails.
 * 
 * @returns Stored application data or null if not found
 * 
 * @example
 * ```ts
 * const savedData = loadApplicationData();
 * if (savedData) {
 *   // Use saved data to pre-fill form
 * }
 * ```
 */
export const loadApplicationData = (): StoredApplicationData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load application data:', error);
    return null;
  }
};

/**
 * Clears application data from localStorage
 * 
 * Removes all saved user data. Useful for privacy or reset functionality.
 * Handles errors gracefully and logs to console if removal fails.
 * 
 * @example
 * ```ts
 * clearApplicationData(); // Removes all saved data
 * ```
 */
export const clearApplicationData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear application data:', error);
  }
};

const APPLIED_JOBS_KEY = 'ikea_applied_jobs';

export const saveAppliedJob = (jobId: number): void => {
  try {
    const existing = getAppliedJobs();
    if (!existing.includes(jobId)) {
      localStorage.setItem(APPLIED_JOBS_KEY, JSON.stringify([...existing, jobId]));
    }
  } catch (error) {
    console.error('Failed to save applied job:', error);
  }
};

export const getAppliedJobs = (): number[] => {
  try {
    const stored = localStorage.getItem(APPLIED_JOBS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const hasAppliedToJob = (jobId: number): boolean =>
  getAppliedJobs().includes(jobId);
