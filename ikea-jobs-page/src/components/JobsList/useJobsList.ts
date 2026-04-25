import { useState, useEffect, useCallback, useMemo } from "react";
import { Job } from "../../types";
import {
  sortJobsByDate,
  filterJobs,
  getUniqueBranches,
  getUniqueProfessions,
} from "./utils";

const normalizeJobsData = (rawData: unknown): Job[] => {
  let jobsArray: unknown[] = [];

  if (Array.isArray(rawData)) {
    jobsArray = rawData;
  } else if (rawData && typeof rawData === "object") {
    const typedRawData = rawData as { jobs?: unknown; data?: unknown };
    if (Array.isArray(typedRawData.jobs)) {
      jobsArray = typedRawData.jobs;
    } else if (Array.isArray(typedRawData.data)) {
      jobsArray = typedRawData.data;
    }
  }

  return jobsArray.filter(
    (item): item is Job => !!item && typeof item === "object"
  );
};

interface UseJobsListReturn {
  filteredJobs: Job[];
  searchTerm: string;
  selectedBranches: string[];
  selectedProfs: string[];
  branches: string[];
  professions: string[];
  isLoading: boolean;
  isFromCache: boolean;
  setSearchTerm: (value: string) => void;
  setSelectedBranches: (values: string[]) => void;
  setSelectedProfs: (values: string[]) => void;
  handleSearch: () => void;
  handleClearFilters: () => void;
}

export const useJobsList = (): UseJobsListReturn => {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedProfs, setSelectedProfs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);

  const fetchJobs = useCallback(async (): Promise<{ jobs: Job[]; source: string }> => {
    try {
      const response = await fetch(`${process.env.REACT_APP_EMAIL_SERVICE_URL || 'http://localhost:3002'}/api/fetch-jobs`);
      if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status}`);
      const data: unknown = await response.json();
      const parsed = data as { jobs?: unknown; source?: string };
      return {
        jobs: normalizeJobsData(parsed.jobs ?? data),
        source: parsed.source ?? 'live',
      };
    } catch (err) {
      console.error("Error fetching jobs:", err);
      return { jobs: [], source: 'live' };
    }
  }, []);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      const { jobs, source } = await fetchJobs();
      const sorted = sortJobsByDate(jobs);
      setAllJobs(sorted);
      setIsFromCache(source === 'cache');
      setIsLoading(false);
    };
    getData();
  }, [fetchJobs]);

  const branches = useMemo(() => getUniqueBranches(allJobs), [allJobs]);
  const professions = useMemo(() => getUniqueProfessions(allJobs), [allJobs]);

  // Live filtering — updates automatically on every state change
  const filteredJobs = useMemo(
    () => filterJobs(allJobs, searchTerm, selectedBranches, selectedProfs),
    [allJobs, searchTerm, selectedBranches, selectedProfs]
  );

  const handleSearch = useCallback(() => {
    // filtering is live via useMemo; this is a no-op kept for the search button
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedBranches([]);
    setSelectedProfs([]);
  }, []);

  return {
    filteredJobs,
    searchTerm,
    selectedBranches,
    selectedProfs,
    branches,
    professions,
    isLoading,
    isFromCache,
    setSearchTerm,
    setSelectedBranches,
    setSelectedProfs,
    handleSearch,
    handleClearFilters,
  };
};
