import { styled } from '@mui/material/styles';
import { Box, Typography, IconButton } from '@mui/material';

export const JobCard = styled(Box)({
  border: '1px solid #e0e0e0',
  padding: '20px',
  background: '#fff',
  direction: 'rtl',
  textAlign: 'right',
  cursor: 'default',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  '&:hover': {
    borderColor: '#000',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
});

export const CardTop = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 8,
});

export const JobTitle = styled(Typography)({
  fontSize: 20,
  fontWeight: 700,
  color: '#000',
  lineHeight: 1.3,
  cursor: 'pointer',
  flex: 1,
  '&:hover': {
    textDecoration: 'underline',
  },
});

export const JobMeta = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

export const MetaRow = styled(Typography)({
  fontSize: 15,
  color: '#555',
  lineHeight: 1.5,
  '& strong': {
    color: '#000',
    fontWeight: 600,
  },
});

export const CardDivider = styled(Box)({
  height: 1,
  background: '#f0f0f0',
  margin: '4px 0',
});

export const CardActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

export const SocialIconsGroup = styled(Box)({
  display: 'flex',
  gap: 4,
});

export const WhatsAppIconBtn = styled(IconButton)({
  color: '#25D366',
  padding: 6,
  '&:hover': {
    background: 'rgba(37,211,102,0.1)',
  },
});

export const FacebookIconBtn = styled(IconButton)({
  color: '#1877F2',
  padding: 6,
  '&:hover': {
    background: 'rgba(24,119,242,0.1)',
  },
});

export const ExpandButton = styled('button')({
  background: 'none',
  border: '1.5px solid #000',
  borderRadius: 20,
  cursor: 'pointer',
  fontSize: 15,
  fontFamily: 'inherit',
  color: '#000',
  padding: '6px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'background 0.15s, color 0.15s',
  whiteSpace: 'nowrap',
  '&:hover': {
    background: '#000',
    color: '#fff',
  },
  '& svg': {
    transition: 'transform 0.25s ease',
  },
});

export const JobDetails = styled(Box)({
  marginTop: 8,
  paddingTop: 16,
  borderTop: '1px solid #e0e0e0',
});

export const JobDescription = styled(Box)({
  marginTop: 12,
  lineHeight: 1.8,
  fontSize: 17,
  color: '#333',
  '& p': { marginBottom: 10 },
  '& ul, & ol': { paddingRight: 20, marginBottom: 10 },
  '& strong': { color: '#000' },
});

export const AppliedStamp = styled(Box)({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: '3px solid #2e7d32',
  borderRadius: 4,
  padding: '4px 14px',
  color: '#2e7d32',
  transform: 'rotate(-8deg)',
  lineHeight: 1.2,
  userSelect: 'none',
  opacity: 0.85,
  '& .stamp-he': {
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: 2,
  },
  '& .stamp-en': {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 3,
  },
});
