import { styled } from '@mui/material/styles';
import { Box, Button, Card, Typography } from '@mui/material';

export const JobCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  textAlign: 'right',
  direction: 'rtl',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

export const JobTitle = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
  '&:hover': {
    textDecoration: 'underline',
  },
}));

export const ShareButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

export const WhatsAppButton = styled(Button)({
  backgroundColor: '#25D366',
  color: 'white',
  '&:hover': {
    backgroundColor: '#20BD5A',
  },
});

export const FacebookButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1877F2',
  '&:hover': {
    backgroundColor: '#145DBF',
  },
}));

export const JobDetails = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

export const JobInfo = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));
