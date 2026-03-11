import { styled } from '@mui/material/styles';
import { Box, TextField, Select, Button, Container, Typography } from '@mui/material';

export const PageContainer = styled(Container)(({ theme }) => ({
  direction: 'rtl',
  padding: theme.spacing(3),
  textAlign: 'right',
}));

export const PageTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 'bold',
}));

export const FiltersContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  flexWrap: 'wrap',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const SearchTextField = styled(TextField)(({ theme }) => ({
  flex: 2,
  minWidth: '200px',
  [theme.breakpoints.down('md')]: {
    flex: 1,
    width: '100%',
  },
}));

export const FilterSelect = styled(Select)(({ theme }) => ({
  flex: 1,
  minWidth: '150px',
  backgroundColor: 'white',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

export const SearchButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 3),
}));

export const ClearButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 3),
}));

export const ResultsCount = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

export const JobsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const NoResults = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
}));
