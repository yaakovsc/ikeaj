import { styled } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';

export const FormContainer = styled(Box)(({ theme }) => ({
  marginTop: '30px',
  padding: '20px',
  borderTop: '1px solid #eee',
  direction: 'rtl',
}));

export const FormTitle = styled(Typography)({
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '25px',
  textAlign: 'right',
});

export const FormRow = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap', // תמיכה במובייל
  gap: '20px',
  alignItems: 'flex-end',
  marginBottom: '20px',
});

export const FieldWrapper = styled(Box)<{ error?: boolean }>(({ error }) => ({
  flex: 1,
  minWidth: '200px',
  position: 'relative',
  '& label': {
    fontSize: '14px',
    color: error ? '#e74c3c' : '#333',
    display: 'block',
    marginBottom: '5px',
  },
  '& .error': {
    color: '#e74c3c',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
  }
}));

export const StyledInput = styled('input')<{ error?: boolean }>(({ error }) => ({
  width: '100%',
  border: 'none',
  borderBottom: error ? '2px solid #e74c3c' : '1px solid #000',
  padding: '8px 0',
  fontSize: '16px',
  outline: 'none',
  background: 'transparent',
  '&:focus': {
    borderBottom: error ? '2px solid #e74c3c' : '2px solid #3498db',
  }
}));

export const FileLabel = styled('label')({
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '16px',
  padding: '8px 0',
  borderBottom: '1px solid #000',
  color: '#333',
});

export const SubmitButton = styled(Button)({
  backgroundColor: '#5dade2',
  color: 'white',
  borderRadius: '8px',
  padding: '10px 40px',
  fontSize: '18px',
  fontWeight: 'bold',
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#3498db',
    boxShadow: 'none',
  },
  '&:disabled': {
    backgroundColor: '#ccc',
  }
});

export const SuccessMessage = styled(Box)(({ theme }) => ({
  backgroundColor: '#d4edda',
  border: '1px solid #c3e6cb',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  color: '#155724',
  marginBottom: '20px',
  '& h3': {
    margin: '0 0 10px 0',
    fontSize: '22px',
  },
  '& p': {
    margin: 0,
    fontSize: '16px',
  }
}));