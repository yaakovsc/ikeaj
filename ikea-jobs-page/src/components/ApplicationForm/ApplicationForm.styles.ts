import { styled } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';

export const FormContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  borderTop: `1px solid ${theme.palette.divider}`,
  direction: 'rtl',
}));

export const FormTitle = styled(Typography)(({ theme }) => ({
  fontSize: '23px',
  fontWeight: 600,
  marginBottom: theme.spacing(3),
  textAlign: 'right',
  color: theme.palette.text.primary,
}));

export const FormRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2.5),
  alignItems: 'flex-end',
  marginBottom: theme.spacing(2.5),
}));

export const FieldWrapper = styled(Box)<{ error?: boolean }>(({ theme, error }) => ({
  flex: 1,
  minWidth: '200px',
  position: 'relative',
  
  '& label': {
    fontSize: '16px',
    color: error ? theme.palette.error.main : theme.palette.text.secondary,
    display: 'block',
    marginBottom: theme.spacing(0.5),
    fontWeight: 500,
  },
  
  '& .error': {
    color: theme.palette.error.main,
    fontSize: '14px',
    marginTop: theme.spacing(0.5),
    display: 'block',
    fontWeight: 400,
  },
}));

export const StyledInput = styled('input')<{ error?: boolean }>(({ theme, error }) => ({
  width: '100%',
  border: 'none',
  borderBottom: error 
    ? `2px solid ${theme.palette.error.main}` 
    : `1px solid ${theme.palette.text.primary}`,
  padding: theme.spacing(1, 0),
  fontSize: '18px',
  outline: 'none',
  background: 'transparent',
  color: theme.palette.text.primary,
  transition: 'border-color 0.2s ease-in-out',
  
  '&:focus': {
    borderBottom: error 
      ? `2px solid ${theme.palette.error.main}` 
      : `2px solid ${theme.palette.primary.main}`,
  },
  
  '&::placeholder': {
    color: theme.palette.text.disabled,
  },
}));

export const FileLabel = styled('label')(({ theme }) => ({
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: '18px',
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.text.primary}`,
  color: theme.palette.text.primary,
  transition: 'color 0.2s ease-in-out',
  
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

export const SubmitButton = styled(Button)({
  backgroundColor: '#000',
  color: '#fff',
  borderRadius: 24,
  padding: '10px 40px',
  fontSize: '18px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'background 0.2s',
  '&:hover': {
    backgroundColor: '#333',
    boxShadow: 'none',
  },
  '&:disabled': {
    backgroundColor: '#999',
    color: '#fff',
  },
});

export const SuccessMessage = styled(Box)({
  backgroundColor: '#f0faf4',
  borderRight: '3px solid #2e7d32',
  padding: '20px 24px',
  marginBottom: 20,
  direction: 'rtl',
  textAlign: 'right',
  '& h3': {
    margin: '0 0 6px',
    fontSize: '20px',
    fontWeight: 700,
    color: '#1b5e20',
  },
  '& p': {
    margin: 0,
    fontSize: '16px',
    color: '#555',
    lineHeight: 1.6,
  },
});

export const ErrorMessage = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.error.light,
  border: `1px solid ${theme.palette.error.main}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.error.dark,
  marginBottom: theme.spacing(2),
  fontSize: '14px',
  fontWeight: 500,
}));
