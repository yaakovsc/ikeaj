import React, { useState, useEffect } from 'react';
import { MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { Job } from '../types';
import JobItem from './JobItem';
import rawData from '../data/adam_all_orders_json.json';
import {
  PageContainer,
  PageTitle,
  FiltersContainer,
  SearchTextField,
  FilterSelect,
  SearchButton,
  ClearButton,
  ResultsCount,
  JobsContainer,
  NoResults,
} from './JobsList.styles';

const JobsList: React.FC = () => {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedProf, setSelectedProf] = useState('');

  useEffect(() => {
    // טעינת כל המשרות ללא סינון תאריכים
    const data = Array.isArray(rawData) ? (rawData as Job[]) : ([rawData] as Job[]);
    
    console.log('📊 סך הכל משרות מהקובץ:', data.length);
    console.log('🔍 דוגמה למשרה ראשונה:', data[0]);
    
    // מיון מהחדש לישן לפי תאריך פרסום (start_advertising_date)
    const sorted = [...data].sort((a: any, b: any) => {
      const dateA = a.start_advertising_date ? new Date(a.start_advertising_date.split('/').reverse().join('-')).getTime() : 0;
      const dateB = b.start_advertising_date ? new Date(b.start_advertising_date.split('/').reverse().join('-')).getTime() : 0;
      return dateB - dateA; // מהחדש לישן
    });
    setAllJobs(sorted);
    setFilteredJobs(sorted);
  }, []);

  const handleSearch = () => {
    const results = allJobs.filter(job => {
      const search = searchTerm.toLowerCase().trim();
      
      // חיפוש חופשי בשם המשרה ובתיאור המשרה בלבד
      const matchesSearch = !search || 
        job.tat_profession_name?.toLowerCase().includes(search) ||  // שם המשרה
        job.description?.toLowerCase().includes(search);             // תיאור המשרה
      
      const matchesBranch = !selectedBranch || job.name_snif === selectedBranch;
      const matchesProf = !selectedProf || job.order_def_prof_name1 === selectedProf;

      return matchesSearch && matchesBranch && matchesProf;
    });
    setFilteredJobs(results);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedBranch('');
    setSelectedProf('');
    setFilteredJobs(allJobs);
  };

  // יצירת רשימות לפילטרים
  const branches = Array.from(new Set(allJobs.map(j => j.name_snif))).filter(Boolean);
  const professions = Array.from(new Set(allJobs.map(j => j.order_def_prof_name1))).filter(Boolean);

  return (
    <PageContainer maxWidth="lg">
      <PageTitle variant="h3">
        לוח משרות
      </PageTitle>

      <FiltersContainer>
        <SearchTextField
          placeholder="חיפוש חופשי..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
        />
        
        <FilterSelect
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value as string)}
          displayEmpty
          size="small"
        >
          <MenuItem value="">כל החנויות</MenuItem>
          {branches.map(b => (
            <MenuItem key={b} value={b}>{b}</MenuItem>
          ))}
        </FilterSelect>

        <FilterSelect
          value={selectedProf}
          onChange={(e) => setSelectedProf(e.target.value as string)}
          displayEmpty
          size="small"
        >
          <MenuItem value="">כל התחומים</MenuItem>
          {professions.map(p => (
            <MenuItem key={p} value={p}>{p}</MenuItem>
          ))}
        </FilterSelect>

        <SearchButton
          variant="contained"
          color="primary"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
        >
          חיפוש
        </SearchButton>

        <ClearButton
          variant="contained"
          color="error"
          onClick={handleClearFilters}
          startIcon={<ClearIcon />}
        >
          נקה הגדרות
        </ClearButton>
      </FiltersContainer>

      <ResultsCount variant="body1">
        נמצאו {filteredJobs.length} משרות
      </ResultsCount>

      <JobsContainer>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => (
            <JobItem key={`${job.order_snif}-${index}`} job={job} />
          ))
        ) : (
          <NoResults variant="h6">
            לא נמצאו משרות העונות על החיפוש.
          </NoResults>
        )}
      </JobsContainer>
    </PageContainer>
  );
};

export default JobsList;