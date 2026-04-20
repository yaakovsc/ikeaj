import { useState, useEffect, useCallback, useMemo } from "react";
import { Job } from "../../types";
import {
  sortJobsByDate,
  filterJobs,
  filterExpiredJobs,
  getUniqueBranches,
  getUniqueProfessions,
} from "./utils";

/**
 * Return type for the useJobsList hook
 */
interface UseJobsListReturn {
  /** The filtered array of jobs based on current search criteria */
  filteredJobs: Job[];
  /** Current search term entered by the user */
  searchTerm: string;
  /** Currently selected branch/store filter */
  selectedBranch: string;
  /** Currently selected profession/field filter */
  selectedProf: string;
  /** Array of unique branch names for the filter dropdown */
  branches: string[];
  /** Array of unique profession names for the filter dropdown */
  professions: string[];
  /** Function to update the search term */
  setSearchTerm: (value: string) => void;
  /** Function to update the selected branch */
  setSelectedBranch: (value: string) => void;
  /** Function to update the selected profession */
  setSelectedProf: (value: string) => void;
  /** Function to apply current filters and update results */
  handleSearch: () => void;
  /** Function to reset all filters and show all jobs */
  handleClearFilters: () => void;
}

/**
 * Custom hook for managing JobsList component state and filtering logic
 *
 * This hook handles:
 * - Loading and sorting job data from JSON file
 * - Managing search and filter state (text search, branch, profession)
 * - Filtering jobs based on multiple criteria
 * - Extracting unique values for dropdown filters
 * - Memoization of computed values for performance
 *
 * @returns {UseJobsListReturn} Object containing jobs data, filters state, and handlers
 *
 * @example
 * ```tsx
 * const {
 *   filteredJobs,
 *   searchTerm,
 *   setSearchTerm,
 *   handleSearch,
 *   handleClearFilters
 * } = useJobsList();
 *
 * // Use in component
 * <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
 * <button onClick={handleSearch}>חפש</button>
 * <button onClick={handleClearFilters}>נקה</button>
 * {filteredJobs.map(job => <JobItem key={job.order_id} job={job} />)}
 * ```
 */
export const useJobsList = (): UseJobsListReturn => {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedProf, setSelectedProf] = useState("");

  useEffect(() => {
    const getData = async () => {
      let data = await fetchJobs();
      data = Array.isArray(data) ? (data as Job[]) : ([data] as Job[]);
      // const activeJobs = filterExpiredJobs(data); // סינון משרות שפג תוקפן - מושבת כי כל התאריכים ב-JSON עברו
      const sorted = sortJobsByDate(data); // שימוש ישיר ב-data במקום activeJobs
      setAllJobs(sorted);
      setFilteredJobs(sorted);
    };
    getData();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/fetch-jobs");
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching jobs JSON:", err);
    }
  };

  const branches = useMemo(() => getUniqueBranches(allJobs), [allJobs]);
  const professions = useMemo(() => getUniqueProfessions(allJobs), [allJobs]);

  const handleSearch = useCallback(() => {
    const results = filterJobs(
      allJobs,
      searchTerm,
      selectedBranch,
      selectedProf,
    );
    setFilteredJobs(results);
  }, [allJobs, searchTerm, selectedBranch, selectedProf]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedBranch("");
    setSelectedProf("");
    setFilteredJobs(allJobs);
  }, [allJobs]);

  return {
    filteredJobs,
    searchTerm,
    selectedBranch,
    selectedProf,
    branches,
    professions,
    setSearchTerm,
    setSelectedBranch,
    setSelectedProf,
    handleSearch,
    handleClearFilters,
  };
};
