import React, { useCallback, useMemo, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Job } from '../types';
import { useApplicationSubmit } from '../hooks/useApplicationSubmit';
import { 
  FormContainer, FormTitle, FormRow, 
  FieldWrapper, StyledInput, FileLabel, SubmitButton, SuccessMessage 
} from './ApplicationForm.styles';
import AttachFileIcon from '@mui/icons-material/AttachFile';

// Schema עם ולידציה מלאה
const applicationSchema = z.object({
  fullName: z.string().min(2, "שם מלא חייב להכיל לפחות 2 תווים"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  phone: z.string().regex(/^05\d-?\d{7}$/, "מספר טלפון לא תקין (לדוגמה: 0501234567)"),
  cvFile: z.any().refine((files: FileList) => files?.length > 0, "חובה לצרף קורות חיים"),
});

type ApplicationSchema = z.infer<typeof applicationSchema>;

interface Props {
  job: Job;
}

const ApplicationForm: React.FC<Props> = ({ job }) => {
  const { submitApplication, isSubmitting, success } = useApplicationSubmit();

  const methods = useForm<ApplicationSchema>({
    resolver: zodResolver(applicationSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    }
  });

  const { register, handleSubmit, watch, formState: { errors }, setValue } = methods;
  const cvFile = watch('cvFile');

  // טעינת נתונים שמורים מ-localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('applicantData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setValue('fullName', parsed.fullName || '');
        setValue('email', parsed.email || '');
        setValue('phone', parsed.phone || '');
      } catch (e) {
        console.error('שגיאה בטעינת נתונים שמורים:', e);
      }
    }
  }, [setValue]);

  const onSubmit = useCallback(async (data: ApplicationSchema) => {
    await submitApplication(job, data);
  }, [job, submitApplication]);

  const fileName = useMemo(() => 
    cvFile?.[0]?.name || 'צירוף קובץ *', 
  [cvFile]);

  if (success) {
    return (
      <SuccessMessage>
        <h3>✅ תודה רבה!</h3>
        <p>המועמדות שלך נשלחה בהצלחה.<br />ניצור איתך קשר בהקדם.</p>
      </SuccessMessage>
    );
  }

  return (
    <FormContainer>
      <FormTitle>הגשת מועמדות</FormTitle>
      
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormRow>
            <FieldWrapper error={!!errors.fullName}>
              <label>שם מלא *</label>
              <StyledInput 
                {...register('fullName')} 
                placeholder="הזן שם מלא"
                error={!!errors.fullName}
              />
              {errors.fullName && <span className="error">{errors.fullName.message as string}</span>}
            </FieldWrapper>

            <FieldWrapper error={!!errors.phone}>
              <label>נייד *</label>
              <StyledInput 
                {...register('phone')} 
                placeholder="050-1234567"
                error={!!errors.phone}
              />
              {errors.phone && <span className="error">{errors.phone.message as string}</span>}
            </FieldWrapper>

            <FieldWrapper error={!!errors.email}>
              <label>אימייל *</label>
              <StyledInput 
                {...register('email')} 
                placeholder="email@example.com"
                error={!!errors.email}
              />
              {errors.email && <span className="error">{errors.email.message as string}</span>}
            </FieldWrapper>

            <FieldWrapper error={!!errors.cvFile}>
              <label>קורות חיים *</label>
              <FileLabel>
                <AttachFileIcon style={{ transform: 'rotate(45deg)' }} />
                <span>{fileName}</span>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  {...register('cvFile')} 
                  style={{ display: 'none' }} 
                />
              </FileLabel>
              {errors.cvFile && <span className="error">{errors.cvFile.message as string}</span>}
            </FieldWrapper>
          </FormRow>

          <FormRow>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שולח...' : 'שלח'}
            </SubmitButton>
          </FormRow>
        </form>
      </FormProvider>
    </FormContainer>
  );
};

export default React.memo(ApplicationForm); // אופטימיזציה לביצועים