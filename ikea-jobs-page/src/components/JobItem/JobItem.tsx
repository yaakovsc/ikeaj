import React, { useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DOMPurify from 'dompurify';
import { Job } from '../../types';
import ApplicationForm from '../ApplicationForm/ApplicationForm';
import { hasAppliedToJob } from '../ApplicationForm/storage';
import { useJobItem } from './useJobItem';
import { JOB_LABELS } from './constants';
import { getDaysRemaining, formatDaysRemaining } from '../JobsList/utils';
import {
  JobCard,
  CardTop,
  JobTitle,
  JobMeta,
  MetaRow,
  CardDivider,
  CardActions,
  SocialIconsGroup,
  WhatsAppIconBtn,
  FacebookIconBtn,
  ExpandButton,
  JobDetails,
  JobDescription,
  AppliedStamp,
} from './JobItem.styles';

interface JobItemProps {
  job: Job;
}

const JobItem: React.FC<JobItemProps> = ({ job }) => {
  const [hasApplied, setHasApplied] = useState(() => hasAppliedToJob(job.order_id));
  const { isOpen, toggleOpen, shareOnWhatsApp, shareOnFacebook } = useJobItem(job);

  const sanitizedNotes = React.useMemo(
    () => DOMPurify.sanitize(job.notes),
    [job.notes]
  );

  const daysRemaining = React.useMemo(
    () => getDaysRemaining(job.close_date),
    [job.close_date]
  );

  return (
    <JobCard>
      <CardTop>
        <JobTitle onClick={hasApplied ? undefined : toggleOpen} style={hasApplied ? { cursor: 'default', textDecoration: 'none' } : undefined}>
          {job.description}
        </JobTitle>
        {daysRemaining >= 0 && daysRemaining <= 14 && (
          <Chip
            icon={<AccessTimeIcon style={{ fontSize: 14 }} />}
            label={formatDaysRemaining(daysRemaining)}
            color={daysRemaining <= 3 ? 'error' : daysRemaining <= 7 ? 'warning' : 'info'}
            size="small"
            style={{ flexShrink: 0, fontSize: 12 }}
          />
        )}
      </CardTop>

      <JobMeta>
        <MetaRow>
          <strong>{job.name_snif}</strong>
          {job.order_def_prof_name1 && ` · ${job.order_def_prof_name1}`}
        </MetaRow>
        {job.living_area1 && (
          <MetaRow>
            {job.living_area1}
            {job.living_area2 && `, ${job.living_area2}`}
          </MetaRow>
        )}
        <MetaRow>
          {JOB_LABELS.DEADLINE} {job.closeDate_ddmmyyy}
        </MetaRow>
      </JobMeta>

      <CardDivider />

      <CardActions>
        <SocialIconsGroup>
          <Tooltip title="שתף בוואטסאפ" placement="top">
            <WhatsAppIconBtn
              onClick={shareOnWhatsApp}
              aria-label="שתף בוואטסאפ"
              size="small"
            >
              <WhatsAppIcon style={{ fontSize: 20 }} />
            </WhatsAppIconBtn>
          </Tooltip>
          <Tooltip title="שתף בפייסבוק" placement="top">
            <FacebookIconBtn
              onClick={shareOnFacebook}
              aria-label="שתף בפייסבוק"
              size="small"
            >
              <FacebookIcon style={{ fontSize: 20 }} />
            </FacebookIconBtn>
          </Tooltip>
        </SocialIconsGroup>

        {hasApplied ? (
          <AppliedStamp>
            <span className="stamp-he">הוגש</span>
            <span className="stamp-en">APPLIED</span>
          </AppliedStamp>
        ) : (
          <ExpandButton onClick={toggleOpen} aria-expanded={isOpen}>
            {isOpen ? 'סגור' : 'לפרטים ולהגשה'}
            <KeyboardArrowDownIcon
              style={{
                fontSize: 18,
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </ExpandButton>
        )}
      </CardActions>

      {isOpen && !hasApplied && (
        <JobDetails>
          <JobDescription dangerouslySetInnerHTML={{ __html: sanitizedNotes }} />
          <ApplicationForm job={job} onApplied={() => setHasApplied(true)} />
        </JobDetails>
      )}
    </JobCard>
  );
};

export default React.memo(JobItem);
