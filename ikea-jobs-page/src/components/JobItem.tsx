import React, { useState } from 'react';
import { Divider } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import { Job } from '../types';
import ApplicationForm from './ApplicationForm';
import {
  JobCard,
  JobTitle,
  ShareButtonsContainer,
  WhatsAppButton,
  FacebookButton,
  JobDetails,
  JobInfo,
} from './JobItem.styles';

interface JobItemProps {
  job: Job;
}

const JobItem: React.FC<JobItemProps> = ({ job }) => {
  const [isOpen, setIsOpen] = useState(false);

  // יצירת URL לשיתוף
  const jobUrl = `${window.location.origin}?job=${job.order_id}`;
  const jobTitle = job.description;
  const jobText = `${jobTitle} - ${job.living_area1}`;

  // פונקציות שיתוף
  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`${jobText}\n${jobUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(jobUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <JobCard>
      <JobTitle variant="h6" onClick={() => setIsOpen(!isOpen)}>
        {job.description}
      </JobTitle>
      
      <ShareButtonsContainer>
        <WhatsAppButton
          variant="contained"
          startIcon={<WhatsAppIcon />}
          onClick={shareOnWhatsApp}
          size="small"
        >
          שתף בוואטסאפ
        </WhatsAppButton>
        <FacebookButton
          variant="contained"
          startIcon={<FacebookIcon />}
          onClick={shareOnFacebook}
          size="small"
        >
          שתף בפייסבוק
        </FacebookButton>
      </ShareButtonsContainer>

      <JobInfo>
        <strong>תחום:</strong> {job.order_def_prof_name1 || job.profession_name}
      </JobInfo>
      <JobInfo>
        <strong>אזור:</strong> {job.living_area1} {job.living_area2 ? `, ${job.living_area2}` : ''}
      </JobInfo>
      <JobInfo>
        <strong>תאריך אחרון להגשה:</strong> {job.closeDate_ddmmyyy}
      </JobInfo>

      {isOpen && (
        <JobDetails>
          <JobTitle variant="h6">תיאור מלא:</JobTitle>
          <div dangerouslySetInnerHTML={{ __html: job.notes }} />
          
          <Divider sx={{ my: 3 }} />
          <ApplicationForm job={job} />
        </JobDetails>
      )}
    </JobCard>
  );
};

export default JobItem;