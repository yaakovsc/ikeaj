import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import JobItem from '../JobItem';
import FilterDropdown from './FilterDropdown';
import { useJobsList } from './useJobsList';
import { LABELS } from './constants';
import { generateJobKey } from './utils';
import {
  PageWrapper,
  StickyHeader,
  TopRibbon,
  RibbonText,
  MainHeaderRow,
  HeaderSearchWrapper,
  HeaderSearchInput,
  HeaderSearchIcon,
  PageTitleBar,
  PageTitle,
  BannerWrapper,
  ContentArea,
  FilterSidebar,
  FilterLabel,
  SearchButton,
  ClearLink,
  ChipsRow,
  FilterChip,
  JobsArea,
  ResultsCount,
  JobsGrid,
  NoResults,
  SkeletonCard,
} from './JobsList.styles';

const JobsList: React.FC = () => {
  const {
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
  } = useJobsList();

  const hasActiveFilters = selectedBranches.length > 0 || selectedProfs.length > 0 || searchTerm.trim().length > 0;

  const removeChip = (type: 'branch' | 'prof', value: string) => {
    if (type === 'branch') setSelectedBranches(selectedBranches.filter(b => b !== value));
    else setSelectedProfs(selectedProfs.filter(p => p !== value));
  };

  return (
    <PageWrapper>
      {/* ── Header ── */}
      <StickyHeader>
        <TopRibbon>
          <RibbonText>IKEA Israel | משרות פנויות</RibbonText>
        </TopRibbon>

        <MainHeaderRow>
          <img
            src={`${process.env.PUBLIC_URL}/ikea-logo.png`}
            alt="IKEA"
            style={{ height: 52, width: 'auto', flexShrink: 0, cursor: 'pointer' }}
          />

          <HeaderSearchWrapper>
            <HeaderSearchInput
              placeholder={LABELS.SEARCH_PLACEHOLDER}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              aria-label={LABELS.SEARCH_PLACEHOLDER}
            />
            <HeaderSearchIcon onClick={handleSearch} aria-label="חפש">
              <SearchIcon style={{ fontSize: 20 }} />
            </HeaderSearchIcon>
          </HeaderSearchWrapper>
        </MainHeaderRow>
      </StickyHeader>

      {/* ── Page title ── */}
      <PageTitleBar>
        <PageTitle variant="h1">{LABELS.PAGE_TITLE}</PageTitle>
      </PageTitleBar>

      {/* ── Banner ── */}
      <BannerWrapper>
        <img
          src={`${process.env.PUBLIC_URL}/banner.avif`}
          alt="IKEA Jobs Banner"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </BannerWrapper>

      {/* ── Cache warning ── */}
      {isFromCache && (
        <div style={{
          background: '#fff8e1',
          borderBottom: '2px solid #f9a825',
          padding: '10px 24px',
          direction: 'rtl',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 15,
          color: '#5d4037',
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span>מסד נתונים מקומי — ADAM לא זמין. המשרות המוצגות עשויות לא לשקף את המצב הנוכחי.</span>
        </div>
      )}

      {/* ── Main content ── */}
      <ContentArea>
        {/* ── Filter sidebar (RTL = appears on right) ── */}
        <FilterSidebar>
          <FilterLabel>{LABELS.FILTER_TITLE}</FilterLabel>

          <FilterDropdown
            label={LABELS.STORE_FILTER}
            options={branches}
            selected={selectedBranches}
            onChange={setSelectedBranches}
          />

          <FilterDropdown
            label={LABELS.DOMAIN_FILTER}
            options={professions}
            selected={selectedProfs}
            onChange={setSelectedProfs}
          />

          <SearchButton variant="contained" onClick={handleSearch} disableElevation>
            {LABELS.SEARCH_BUTTON}
          </SearchButton>

          {hasActiveFilters && (
            <ClearLink onClick={handleClearFilters}>{LABELS.CLEAR_BUTTON}</ClearLink>
          )}
        </FilterSidebar>

        {/* ── Jobs area (RTL = appears on left) ── */}
        <JobsArea>
          {/* Active filter chips */}
          {(selectedBranches.length > 0 || selectedProfs.length > 0) && (
            <ChipsRow>
              {selectedBranches.map(b => (
                <FilterChip key={b}>
                  <span>{b}</span>
                  <button onClick={() => removeChip('branch', b)} aria-label={`הסר ${b}`}>×</button>
                </FilterChip>
              ))}
              {selectedProfs.map(p => (
                <FilterChip key={p}>
                  <span>{p}</span>
                  <button onClick={() => removeChip('prof', p)} aria-label={`הסר ${p}`}>×</button>
                </FilterChip>
              ))}
            </ChipsRow>
          )}

          <ResultsCount role="status" aria-live="polite">
            {isLoading ? LABELS.LOADING : `${LABELS.RESULTS_COUNT} ${filteredJobs.length} ${LABELS.RESULTS_SUFFIX}`}
          </ResultsCount>

          <JobsGrid>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <JobItem key={generateJobKey(job, index)} job={job} />
              ))
            ) : (
              <NoResults role="alert">{LABELS.NO_RESULTS}</NoResults>
            )}
          </JobsGrid>
        </JobsArea>
      </ContentArea>
    </PageWrapper>
  );
};

export default React.memo(JobsList);
