/**
 * ApplicationForm Constants
 * 
 * This file contains all constant values used in the ApplicationForm component:
 * - Validation patterns (regex)
 * - Error messages (Hebrew)
 * - File upload configuration
 * - Form field identifiers
 */

/**
 * Regular expression patterns for form validation
 * 
 * - NAME: Allows Hebrew (א-ת) and English (a-zA-Z) letters plus spaces
 * - PHONE: Israeli mobile format - starts with 05, followed by 8 digits, optional dash after area code
 *   Valid examples: "050-1234567", "0501234567", "052-9876543"
 */
export const VALIDATION_PATTERNS = {
  NAME: /^[א-תa-zA-Z\s]+$/,
  PHONE: /^05\d-?\d{7}$/,
} as const;

/**
 * User-facing error messages in Hebrew
 * 
 * These messages are displayed when validation fails.
 * Keep them clear, concise, and actionable.
 */
export const ERROR_MESSAGES = {
  NAME_TOO_SHORT: 'חייב להכיל לפחות 2 תווים',
  NAME_INVALID_CHARS: 'אותיות בלבד',
  EMAIL_INVALID: 'כתובת אימייל לא תקינה',
  PHONE_INVALID: 'מספר טלפון לא תקין (050-1234567)',
  SUBMISSION_ERROR: 'שגיאה בשליחת המועמדות',
} as const;

/**
 * File upload configuration
 * 
 * - ACCEPTED_TYPES: MIME types/extensions allowed for CV upload
 * - PLACEHOLDER: Text shown in file input field
 */
export const FILE_CONFIG = {
  ACCEPTED_TYPES: '.pdf,.doc,.docx',
  PLACEHOLDER: 'צירוף קובץ (אופציונלי)',
} as const;

/**
 * Form field names matching the schema keys
 * 
 * Use these constants instead of hardcoded strings to prevent typos
 * and enable easy refactoring.
 */
export const FORM_FIELDS = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  PHONE: 'phone',
  CV_FILE: 'cvFile',
} as const;
