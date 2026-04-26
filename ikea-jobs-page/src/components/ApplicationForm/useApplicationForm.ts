import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Job } from '../../types';
import { sendJobApplication } from '../../services/applicationService';
import { applicationSchema, ApplicationFormData } from './schema';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
import { saveApplicationData, loadApplicationData, saveAppliedJob } from './storage';
/**
 * Return type for useApplicationForm hook
 */
interface UseApplicationFormReturn {
  methods: ReturnType<typeof useForm<ApplicationFormData>>;
  isSubmitting: boolean;
  success: boolean;
  successMessage: string | null;
  error: string | null;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
}

/**
 * Custom Hook: useApplicationForm
 * 
 * Manages application form state, validation, submission, and localStorage.
 * 
 * Features:
 * - Form validation with Zod schema
 * - Auto-load saved data from localStorage
 * - Auto-save on successful submission
 * - Error handling and user feedback
 * - Integration with backend API
 * 
 * @param job - Job object for which the application is submitted
 * @returns Form methods and state
 * 
 * @example
 * ```tsx
 * const { methods, isSubmitting, success, error, onSubmit } = useApplicationForm(job);
 * ```
 */
export const useApplicationForm = (job: Job, onApplied?: () => void): UseApplicationFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadApplicationData();
    if (savedData) {
      methods.reset({
        firstName: savedData.firstName,
        lastName: savedData.lastName,
        email: savedData.email,
        phone: savedData.phone,
      });
    }
  }, [methods]);

  const onSubmit = useCallback(
    async (data: ApplicationFormData) => {
      setIsSubmitting(true);
      setError(null);

      try {
        // Save data to localStorage (excluding cvFile)
        saveApplicationData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        });

        const result = await sendJobApplication(job, data);

        if (result.adamOk) {
          // ADAM accepted the application — lock the job
          saveAppliedJob(job.order_id);
          onApplied?.();
          methods.setValue('cvFile', undefined);
          setSuccessMessage(result.emailOk ? SUCCESS_MESSAGES.FULL : SUCCESS_MESSAGES.EMAIL_FAILED);
          setSuccess(true);
        } else {
          setError(ERROR_MESSAGES.DELIVERY_FAILED);
        }
      } catch (err) {
        setError(ERROR_MESSAGES.SUBMISSION_ERROR);
        console.error('Application submission error:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [job, methods]
  );

  return {
    methods,
    isSubmitting,
    success,
    successMessage,
    error,
    onSubmit,
  };
};