import { Job } from '../../types';

/**
 * Filters out expired jobs based on close_date
 * 
 * Only returns jobs where the close date is in the future.
 * Today's date is considered valid (can still apply today).
 * 
 * @param {Job[]} jobs - Array of jobs to filter
 * @returns {Job[]} Array of active jobs only
 * 
 * @example
 * ```typescript
 * const activeJobs = filterExpiredJobs(allJobs);
 * // Returns only jobs with close_date >= today
 * ```
 */
export const filterExpiredJobs = (jobs: Job[]): Job[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day for fair comparison
  
  return jobs.filter((job) => {
    if (!job.close_date) return true; // Keep jobs without close date
    const closeDate = new Date(job.close_date);
    return closeDate >= today;
  });
};

/**
 * Calculates days remaining until job deadline
 * 
 * @param {string} closeDate - ISO date string (e.g., "2025-06-26T00:00:00")
 * @returns {number} Number of days remaining, or -1 if expired/invalid
 * 
 * @example
 * ```typescript
 * const days = getDaysRemaining("2025-12-31T00:00:00");
 * // Returns: 280 (if today is March 17, 2026 - wait this would be negative!)
 * ```
 */
export const getDaysRemaining = (closeDate: string): number => {
  if (!closeDate) return -1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(closeDate);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Formats days remaining into Hebrew text
 * 
 * @param {number} days - Number of days remaining
 * @returns {string} Formatted Hebrew text
 * 
 * @example
 * ```typescript
 * formatDaysRemaining(5);  // "נותרו 5 ימים"
 * formatDaysRemaining(1);  // "נותר יום אחד"
 * formatDaysRemaining(0);  // "מסתיים היום!"
 * formatDaysRemaining(-1); // "פג תוקף"
 * ```
 */
export const formatDaysRemaining = (days: number): string => {
  if (days < 0) return 'פג תוקף';
  if (days === 0) return 'מסתיים היום!';
  if (days === 1) return 'נותר יום אחד';
  if (days <= 7) return `נותרו ${days} ימים - מהרו!`;
  return `נותרו ${days} ימים`;
};

/**
 * Sorts jobs by start advertising date in descending order (newest first)
 * 
 * This function:
 * - Creates a new array to avoid mutating the original
 * - Parses DD/MM/YYYY format dates to timestamps
 * - Handles missing dates by treating them as epoch (0)
 * - Sorts in reverse chronological order
 * 
 * @param {Job[]} jobs - Array of jobs to sort
 * @returns {Job[]} New sorted array with newest jobs first
 * 
 * @example
 * ```typescript
 * const jobs = [
 *   { start_advertising_date: "15/01/2024", ... },
 *   { start_advertising_date: "20/01/2024", ... },
 *   { start_advertising_date: "10/01/2024", ... }
 * ];
 * const sorted = sortJobsByDate(jobs);
 * // Returns jobs in order: 20/01, 15/01, 10/01
 * ```
 */
export const sortJobsByDate = (jobs: Job[]): Job[] => {
  return [...jobs].sort((a, b) => {
    const dateA = (a as any).start_advertising_date
      ? new Date((a as any).start_advertising_date.split('/').reverse().join('-')).getTime()
      : 0;
    const dateB = (b as any).start_advertising_date
      ? new Date((b as any).start_advertising_date.split('/').reverse().join('-')).getTime()
      : 0;
    return dateB - dateA;
  });
};

/**
 * Filters jobs based on multiple search criteria
 * 
 * Applies three types of filters:
 * 1. Text search - matches against profession name and job description (case-insensitive)
 * 2. Branch filter - exact match on store/branch name
 * 3. Profession filter - exact match on profession/field name
 * 
 * All filters are AND-combined (a job must match all active filters).
 * Empty filter values are ignored.
 * 
 * @param {Job[]} jobs - Array of jobs to filter
 * @param {string} searchTerm - Text to search for in job titles/descriptions
 * @param {string[]} selectedBranches - Branches/stores to filter by (empty = all)
 * @param {string[]} selectedProfs - Professions/fields to filter by (empty = all)
 * @returns {Job[]} Filtered array of jobs matching all criteria
 * 
 * @example
 * ```typescript
 * const results = filterJobs(
 *   allJobs,
 *   "מנהל",        // Search term
 *   "תל אביב",     // Branch
 *   ""             // No profession filter
 * );
 * // Returns jobs in Tel Aviv with "מנהל" in title/description
 * ```
 */
export const filterJobs = (
  jobs: Job[],
  searchTerm: string,
  selectedBranches: string[],
  selectedProfs: string[]
): Job[] => {
  return jobs.filter((job) => {
    if (!job) return false;

    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      job.tat_profession_name?.toLowerCase().includes(search) ||
      job.description?.toLowerCase().includes(search);

    const matchesBranch = selectedBranches.length === 0 || selectedBranches.includes(job.name_snif);
    const matchesProf = selectedProfs.length === 0 || selectedProfs.includes(job.order_def_prof_name1);

    return matchesSearch && matchesBranch && matchesProf;
  });
};

/**
 * Extracts unique branch/store names from jobs array
 * 
 * Creates a deduplicated list of branch names for use in filter dropdowns.
 * Filters out null/undefined/empty values.
 * 
 * @param {Job[]} jobs - Array of jobs to extract branches from
 * @returns {string[]} Array of unique branch names
 * 
 * @example
 * ```typescript
 * const branches = getUniqueBranches(jobs);
 * // Returns: ["תל אביב", "חיפה", "באר שבע", ...]
 * ```
 */
export const getUniqueBranches = (jobs: Job[]): string[] => {
  return Array.from(
    new Set(
      jobs
        .map((j) => j?.name_snif)
        .filter((branch): branch is string => typeof branch === 'string' && branch.trim().length > 0)
    )
  );
};

/**
 * Extracts unique profession/field names from jobs array
 * 
 * Creates a deduplicated list of profession names for use in filter dropdowns.
 * Filters out null/undefined/empty values.
 * 
 * @param {Job[]} jobs - Array of jobs to extract professions from
 * @returns {string[]} Array of unique profession names
 * 
 * @example
 * ```typescript
 * const professions = getUniqueProfessions(jobs);
 * // Returns: ["ניהול", "מכירות", "לוגיסטיקה", ...]
 * ```
 */
export const getUniqueProfessions = (jobs: Job[]): string[] => {
  return Array.from(
    new Set(
      jobs
        .map((j) => j?.order_def_prof_name1)
        .filter(
          (profession): profession is string =>
            typeof profession === 'string' && profession.trim().length > 0
        )
    )
  );
};

/**
 * Generates a unique, stable key for rendering job items in React lists
 * 
 * Combines multiple identifiers to ensure uniqueness:
 * - order_snif: Branch/store identifier
 * - order_id: Job order identifier
 * - index: Position in the filtered array (fallback for duplicates)
 * 
 * This prevents React key warnings and ensures proper component reconciliation.
 * 
 * @param {Job} job - The job object to generate a key for
 * @param {number} index - The index of the job in the current list
 * @returns {string} Unique key string for React rendering
 * 
 * @example
 * ```tsx
 * {jobs.map((job, idx) => (
 *   <JobItem key={generateJobKey(job, idx)} job={job} />
 * ))}
 * ```
 */
export const generateJobKey = (job: Job, index: number): string => {
  return `${job.order_snif}-${job.order_id}-${index}`;
};
