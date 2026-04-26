import React, { useMemo } from 'react';
import { FormProvider } from 'react-hook-form';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Job } from '../../types';
import { useApplicationForm } from './useApplicationForm';
import { FILE_CONFIG } from './constants';
import {
  FormContainer,
  FormTitle,
  FormRow,
  FieldWrapper,
  StyledInput,
  FileLabel,
  SubmitButton,
  SuccessMessage,
  ErrorMessage,
} from './ApplicationForm.styles';

interface ApplicationFormProps {
  job: Job;
  onApplied?: () => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ job, onApplied }) => {
  const { methods, isSubmitting, success, successMessage, error, onSubmit } = useApplicationForm(job, onApplied);
  const { register, handleSubmit, watch, formState: { errors } } = methods;
  
  const cvFile = watch('cvFile');
  const fileName = useMemo(
    () => cvFile?.[0]?.name || FILE_CONFIG.PLACEHOLDER,
    [cvFile]
  );

  if (success) {
    const isWarning = successMessage?.includes('נכשלה');
    return (
      <SuccessMessage style={isWarning ? { borderColor: '#e65100' } : undefined}>
        <h3 style={isWarning ? { color: '#e65100' } : undefined}>
          {isWarning ? 'המועמדות הוגשה' : 'המועמדות נשלחה בהצלחה'}
        </h3>
        <p>{successMessage}</p>
      </SuccessMessage>
    );
  }

  return (
    <FormContainer>
      <FormTitle>הגשת מועמדות</FormTitle>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormRow>
            <FieldWrapper error={!!errors.firstName}>
              <label htmlFor="firstName">שם פרטי *</label>
              <StyledInput
                id="firstName"
                {...register('firstName')}
                placeholder="שם פרטי"
                error={!!errors.firstName}
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
              {errors.firstName && (
                <span id="firstName-error" className="error" role="alert">
                  {errors.firstName.message}
                </span>
              )}
            </FieldWrapper>

            <FieldWrapper error={!!errors.lastName}>
              <label htmlFor="lastName">שם משפחה *</label>
              <StyledInput
                id="lastName"
                {...register('lastName')}
                placeholder="שם משפחה"
                error={!!errors.lastName}
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName && (
                <span id="lastName-error" className="error" role="alert">
                  {errors.lastName.message}
                </span>
              )}
            </FieldWrapper>

            <FieldWrapper error={!!errors.phone}>
              <label htmlFor="phone">נייד *</label>
              <StyledInput
                id="phone"
                {...register('phone')}
                placeholder="050-1234567"
                error={!!errors.phone}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && (
                <span id="phone-error" className="error" role="alert">
                  {errors.phone.message}
                </span>
              )}
            </FieldWrapper>
            <FieldWrapper error={!!errors.email}>
              <label htmlFor="email">אימייל *</label>
              <StyledInput
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@example.com"
                error={!!errors.email}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <span id="email-error" className="error" role="alert">
                  {errors.email.message}
                </span>
              )}
            </FieldWrapper>

            <FieldWrapper error={!!errors.cvFile}>
              <label htmlFor="cvFile">קורות חיים (אופציונלי)</label>
              <FileLabel htmlFor="cvFile">
                <AttachFileIcon style={{ transform: 'rotate(45deg)' }} />
                <span>{fileName}</span>
                <input
                  id="cvFile"
                  type="file"
                  accept={FILE_CONFIG.ACCEPTED_TYPES}
                  {...register('cvFile')}
                  style={{ display: 'none' }}
                  aria-describedby={errors.cvFile ? 'cvFile-error' : undefined}
                />
              </FileLabel>
              {errors.cvFile && (
                <span id="cvFile-error" className="error" role="alert">
                  {errors.cvFile.message as string}
                </span>
              )}
            </FieldWrapper>
          </FormRow>

          {error && (
            <ErrorMessage role="alert" aria-live="polite">
              {error}
            </ErrorMessage>
          )}

          <FormRow>
            <SubmitButton
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'שולח...' : 'שלח'}
            </SubmitButton>
          </FormRow>
        </form>
      </FormProvider>
    </FormContainer>
  );
};

export default React.memo(ApplicationForm);
