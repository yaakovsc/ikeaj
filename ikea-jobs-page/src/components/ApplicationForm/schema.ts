import * as z from 'zod';
import { sanitizeInput } from './utils';
import { VALIDATION_PATTERNS, ERROR_MESSAGES } from './constants';

/**
 * Zod validation schema for job application form
 * 
 * This schema validates and sanitizes all form inputs:
 * - fullName: Minimum 2 characters, Hebrew/English letters only, sanitized against XSS
 * - email: Valid email format, sanitized against XSS
 * - phone: Israeli mobile format (05X-XXXXXXX or 05XXXXXXXX), sanitized
 * - cvFile: Optional file upload (validation handled by browser)
 * 
 * All string fields are automatically sanitized using DOMPurify via the transform function.
 * 
 * @example
 * ```typescript
 * // Valid data
 * const validData = {
 *   fullName: "ישראל ישראלי",
 *   email: "israel@example.com",
 *   phone: "050-1234567",
 *   cvFile: fileList // optional
 * };
 * 
 * const result = applicationSchema.safeParse(validData);
 * if (result.success) {
 *   console.log("Valid:", result.data);
 * }
 * ```
 */
export const applicationSchema = z.object({
  firstName: z
    .string()
    .min(2, ERROR_MESSAGES.NAME_TOO_SHORT)
    .regex(VALIDATION_PATTERNS.NAME, ERROR_MESSAGES.NAME_INVALID_CHARS)
    .transform(sanitizeInput),
  lastName: z
    .string()
    .min(2, ERROR_MESSAGES.NAME_TOO_SHORT)
    .regex(VALIDATION_PATTERNS.NAME, ERROR_MESSAGES.NAME_INVALID_CHARS)
    .transform(sanitizeInput),
  email: z
    .string()
    .email(ERROR_MESSAGES.EMAIL_INVALID)
    .transform(sanitizeInput),
  phone: z
    .string()
    .regex(VALIDATION_PATTERNS.PHONE, ERROR_MESSAGES.PHONE_INVALID)
    .transform(sanitizeInput),
  cvFile: z.any().optional(),
});

/**
 * TypeScript type inferred from the Zod schema
 * 
 * Use this type for form data throughout the application
 * to ensure type safety and consistency with validation rules.
 */
export type ApplicationFormData = z.infer<typeof applicationSchema>;
