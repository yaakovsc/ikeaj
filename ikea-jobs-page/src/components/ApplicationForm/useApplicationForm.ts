import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Job } from '../../types';
import { sendJobApplication } from '../../services/applicationService';
import { applicationSchema, ApplicationFormData } from './schema';
import { extractErrorMessage } from './utils';
import { ERROR_MESSAGES } from './constants';
import { saveApplicationData, loadApplicationData, saveAppliedJob } from './storage';
/**
 * Return type for useApplicationForm hook
 */
interface UseApplicationFormReturn {
  /** React Hook Form methods */
  methods: ReturnType<typeof useForm<ApplicationFormData>>;
  /** Loading state during submission */
  isSubmitting: boolean;
  /** Success state after submission */
  success: boolean;
  /** Error message if submission failed */
  error: string | null;
  /** Form submission handler */
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
        //use the email service instead of active trail for sending applications
        //const result = await sendJobApplicationEmail(job, data);

        if (result.success) {
          setSuccess(true);
          methods.setValue('cvFile', undefined);
          saveAppliedJob(job.order_id);
          onApplied?.();
        } else {
          const errorMsg = extractErrorMessage(result.error, ERROR_MESSAGES.SUBMISSION_ERROR);
          setError(errorMsg);
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
    error,
    onSubmit,
  };
};