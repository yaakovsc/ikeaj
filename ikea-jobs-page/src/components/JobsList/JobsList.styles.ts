import { styled } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';

// ─── Page shell ──────────────────────────────────────────────────────────────

export const PageWrapper = styled(Box)({
  direction: 'rtl',
  minHeight: '100vh',
  background: '#fff',
  fontFamily: '"Segoe UI", Arial, sans-serif',
});

// ─── Sticky header ───────────────────────────────────────────────────────────

export const StickyHeader = styled(Box)({
  position: 'sticky',
  top: 0,
  zIndex: 1000,
});

export const TopRibbon = styled(Box)({
  width: '100%',
  height: 40,
  background: '#000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '0 24px',
  boxSizing: 'border-box',
});

export const RibbonText = styled(Typography)({
  color: '#fff',
  fontSize: 15,
  fontWeight: 400,
});

export const MainHeaderRow = styled(Box)(({ theme }) => ({
  background: '#fff',
  borderBottom: '1px solid #e0e0e0',
  padding: '0 32px',
  height: 72,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  direction: 'rtl',
  [theme.breakpoints.down('sm')]: {
    padding: '0 16px',
    height: 60,
  },
}));

export const HeaderSearchWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  border: '1.5px solid #bbb',
  borderRadius: 2,
  overflow: 'hidden',
  width: 320,
  direction: 'rtl',
  [theme.breakpoints.down('sm')]: {
    width: 180,
  },
}));

export const HeaderSearchInput = styled('input')({
  flex: 1,
  border: 'none',
  outline: 'none',
  padding: '8px 12px',
  fontSize: 17,
  fontFamily: 'inherit',
  direction: 'rtl',
  background: 'transparent',
  '&::placeholder': { color: '#999' },
});

export const HeaderSearchIcon = styled(Box)({
  padding: '0 12px',
  display: 'flex',
  alignItems: 'center',
  color: '#555',
  cursor: 'pointer',
});

// ─── Page title ──────────────────────────────────────────────────────────────

export const PageTitleBar = styled(Box)(({ theme }) => ({
  padding: '28px 32px 20px',
  direction: 'rtl',
  [theme.breakpoints.down('sm')]: {
    padding: '20px 16px 12px',
  },
}));

export const PageTitle = styled(Typography)({
  fontSize: 38,
  fontWeight: 700,
  color: '#000',
  lineHeight: 1.2,
});

// ─── Banner ───────────────────────────────────────────────────────────────────

export const BannerWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 280,
  overflow: 'hidden',
  background: '#e8e0d4',
  [theme.breakpoints.down('md')]: {
    height: 200,
  },
  [theme.breakpoints.down('sm')]: {
    height: 140,
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
}));

// ─── Main content area ────────────────────────────────────────────────────────

export const ContentArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  direction: 'rtl',
  gap: 32,
  padding: '32px 32px',
  alignItems: 'flex-start',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    padding: '20px 16px',
    gap: 20,
  },
}));

// ─── Filter sidebar ───────────────────────────────────────────────────────────

export const FilterSidebar = styled(Box)(({ theme }) => ({
  width: 280,
  flexShrink: 0,
  direction: 'rtl',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

export const FilterLabel = styled(Typography)({
  fontSize: 15,
  fontWeight: 700,
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 12,
});

export const SearchButton = styled(Button)({
  width: '100%',
  background: '#000',
  color: '#fff',
  borderRadius: 24,
  padding: '11px 0',
  fontSize: 18,
  fontWeight: 600,
  fontFamily: 'inherit',
  textTransform: 'none',
  marginTop: 4,
  boxShadow: 'none',
  '&:hover': {
    background: '#333',
    boxShadow: 'none',
  },
});

export const ClearLink = styled('button')({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#555',
  fontSize: 15,
  textDecoration: 'underline',
  padding: '8px 0 0',
  display: 'block',
  fontFamily: 'inherit',
  '&:hover': { color: '#000' },
});

// ─── Active filter chips ──────────────────────────────────────────────────────

export const ChipsRow = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 16,
  direction: 'rtl',
});

export const FilterChip = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: '#000',
  color: '#fff',
  fontSize: 15,
  padding: '4px 10px',
  borderRadius: 2,
  '& button': {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
    marginRight: -2,
    opacity: 0.7,
    '&:hover': { opacity: 1 },
  },
});

// ─── Jobs grid ────────────────────────────────────────────────────────────────

export const JobsArea = styled(Box)({
  flex: 1,
  minWidth: 0,
  direction: 'rtl',
});

export const ResultsCount = styled(Typography)({
  fontSize: 16,
  color: '#666',
  marginBottom: 16,
  direction: 'rtl',
});

export const JobsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 20,
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const NoResults = styled(Box)({
  textAlign: 'center',
  padding: '60px 0',
  color: '#999',
  fontSize: 20,
  gridColumn: '1 / -1',
});

// ─── Loading skeleton ─────────────────────────────────────────────────────────

export const SkeletonCard = styled(Box)({
  border: '1px solid #e8e8e8',
  padding: 20,
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-400px 0' },
    '100%': { backgroundPosition: '400px 0' },
  },
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '800px 100%',
  animation: 'shimmer 1.4s infinite linear',
  height: 140,
  borderRadius: 2,
});
