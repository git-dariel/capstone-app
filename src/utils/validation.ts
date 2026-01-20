// Validation utility for inventory form fields
import {
  validateNoXSS,
  validateNoSqlInjection,
  sanitizeName,
  sanitizeNumber,
} from "./sanitization";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: string) => boolean;
  sanitize?: (value: string) => string;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

// Common validation patterns
export const patterns = {
  name: /^[a-zA-Z\s\u00C0-\u017F'-]+$/,
  alphabetic: /^[a-zA-Z\s]+$/,
  numeric: /^\d+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9+\-\s()]+$/,
  postalCode: /^\d{4,6}$/,
  height:
    /^(\d+'\s*\d+"?|\d+'\s*\d+|\d+(\.\d+)?\s*(ft|feet|cm|m|in|inches)?|\d+(\.\d+)?['"]?)$/i,
  weight: /^\d+(\.\d+)?\s*(kg|lbs|pounds)?$/i,
};

// Validation messages
export const messages = {
  required: "This field is required",
  invalidFormat: "Invalid format",
  invalidName:
    "Please enter a valid name (letters, spaces, hyphens, and apostrophes only)",
  invalidNumber: "Please enter a valid number",
  invalidEmail: "Please enter a valid email address",
  invalidPhone: "Please enter a valid phone number",
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must not exceed ${max} characters`,
  minValue: (min: number) => `Must be at least ${min}`,
  maxValue: (max: number) => `Must not exceed ${max}`,
  invalidAge: "Age must be between 0 and 150",
  invalidHeight: "Please enter a valid height (e.g., 5'7, 5'8\", 170cm, 5.7ft)",
  invalidWeight: "Please enter a valid weight (e.g., 150lbs, 70kg)",
  invalidPostalCode: "Please enter a valid postal/zip code",
  dangerousContent:
    "Input contains potentially dangerous content. HTML tags and scripts are not allowed.",
  sqlInjection: "Input contains potentially dangerous patterns.",
};

// Validate a single field
export const validateField = (
  value: string,
  rules: ValidationRule[],
): string | null => {
  // Convert value to string safely
  const stringValue = value == null ? "" : String(value);

  for (const rule of rules) {
    // Required check
    if (rule.required && (!stringValue || stringValue.trim() === "")) {
      return rule.message;
    }

    // Skip other validations if value is empty and not required
    if (!stringValue || stringValue.trim() === "") {
      continue;
    }

    // XSS validation - check all non-empty inputs
    const xssCheck = validateNoXSS(stringValue);
    if (!xssCheck.isValid) {
      return messages.dangerousContent;
    }

    // SQL injection validation - check all non-empty inputs
    const sqlCheck = validateNoSqlInjection(stringValue);
    if (!sqlCheck.isValid) {
      return messages.sqlInjection;
    }

    // Min length check
    if (rule.minLength && stringValue.length < rule.minLength) {
      return rule.message;
    }

    // Max length check
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return rule.message;
    }

    // Pattern check
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return rule.message;
    }

    // Min value check (for numbers)
    if (rule.min !== undefined) {
      const numValue = parseFloat(stringValue);
      if (isNaN(numValue) || numValue < rule.min) {
        return rule.message;
      }
    }

    // Max value check (for numbers)
    if (rule.max !== undefined) {
      const numValue = parseFloat(stringValue);
      if (isNaN(numValue) || numValue > rule.max) {
        return rule.message;
      }
    }

    // Custom validation
    if (rule.custom && !rule.custom(stringValue)) {
      return rule.message;
    }
  }

  return null;
};

// Validate multiple fields
export const validateForm = (
  formData: Record<string, unknown>,
  validationRules: ValidationRules,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(validationRules).forEach((fieldKey) => {
    const value = getNestedValue(formData, fieldKey);
    const rules = validationRules[fieldKey];
    const error = validateField(value, rules);

    if (error) {
      errors[fieldKey] = error;
    }
  });

  return errors;
};

// Helper to get nested object value by dot notation (e.g., "father.firstName")
const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  return path.split(".").reduce((current: unknown, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return "";
  }, obj as unknown) as string;
};

// Inventory form specific validation rules
// NOTE: XSS and SQL injection checks are automatically applied to ALL fields in validateField()
export const inventoryValidationRules: ValidationRules = {
  // Basic Physical Information
  height: [
    { required: true, message: messages.required },
    { pattern: patterns.height, message: messages.invalidHeight },
    { maxLength: 20, message: messages.maxLength(20) },
  ],
  weight: [
    { required: true, message: messages.required },
    { pattern: patterns.weight, message: messages.invalidWeight },
    { maxLength: 20, message: messages.maxLength(20) },
  ],
  coplexion: [
    { required: true, message: messages.required },
    { minLength: 2, message: messages.minLength(2) },
    { maxLength: 50, message: messages.maxLength(50) },
  ],

  // Emergency Contact
  "person_to_be_contacted_in_case_of_accident_or_illness.firstName": [
    { required: true, message: messages.required },
    { pattern: patterns.name, message: messages.invalidName },
    { minLength: 2, message: messages.minLength(2) },
    { maxLength: 50, message: messages.maxLength(50) },
    { sanitize: sanitizeName, message: "Name sanitized" },
  ],
  "person_to_be_contacted_in_case_of_accident_or_illness.lastName": [
    { required: true, message: messages.required },
    { pattern: patterns.name, message: messages.invalidName },
    { minLength: 2, message: messages.minLength(2) },
    { maxLength: 50, message: messages.maxLength(50) },
    { sanitize: sanitizeName, message: "Name sanitized" },
  ],
  "person_to_be_contacted_in_case_of_accident_or_illness.middleName": [
    { pattern: patterns.name, message: messages.invalidName },
    { maxLength: 50, message: messages.maxLength(50) },
    { sanitize: sanitizeName, message: "Name sanitized" },
  ],

  // Father Information
  "home_and_family_background.father.firstName": [
    { required: true, message: messages.required },
    { pattern: patterns.name, message: messages.invalidName },
    { minLength: 2, message: messages.minLength(2) },
    { maxLength: 50, message: messages.maxLength(50) },
    { sanitize: sanitizeName, message: "Name sanitized" },
  ],
  "home_and_family_background.father.lastName": [
    { required: true, message: messages.required },
    { pattern: patterns.name, message: messages.invalidName },
    { minLength: 2, message: messages.minLength(2) },
    { maxLength: 50, message: messages.maxLength(50) },
    { sanitize: sanitizeName, message: "Name sanitized" },
  ],
  "home_and_family_background.father.age": [
    { required: true, message: messages.required },
    { pattern: patterns.numeric, message: messages.invalidNumber },
    { min: 0, message: messages.invalidAge },
    { max: 150, message: messages.invalidAge },
    { sanitize: sanitizeNumber, message: "Number sanitized" },
  ],

  // Mother Information
  "home_and_family_background.mother.firstName": [
    { required: true, message: messages.required },
    { pattern: patterns.name, message: messages.invalidName },
    { minLength: 2, message: messages.minLength(2) },
    { maxLength: 50, message: messages.maxLength(50) },
    { sanitize: sanitizeName, message: "Name sanitized" },
  ],
  "home_and_family_background.mother.lastName": [
    { required: true, message: messages.required },
    { pattern: patterns.name, message: messages.invalidName },
    { minLength: 2, message: messages.minLength(2) },
    { maxLength: 50, message: messages.maxLength(50) },
    { sanitize: sanitizeName, message: "Name sanitized" },
  ],
  "home_and_family_background.mother.age": [
    { required: true, message: messages.required },
    { pattern: patterns.numeric, message: messages.invalidNumber },
    { min: 0, message: messages.invalidAge },
    { max: 150, message: messages.invalidAge },
    { sanitize: sanitizeNumber, message: "Number sanitized" },
  ],

  // Guardian Information (optional, but validate if provided)
  "home_and_family_background.guardian.firstName": [
    { pattern: patterns.name, message: messages.invalidName },
    { maxLength: 50, message: messages.maxLength(50) },
    { sanitize: sanitizeName, message: "Name sanitized" },
  ],
  "home_and_family_background.guardian.age": [
    { pattern: patterns.numeric, message: messages.invalidNumber },
    { min: 0, message: messages.invalidAge },
    { max: 150, message: messages.invalidAge },
    { sanitize: sanitizeNumber, message: "Number sanitized" },
  ],

  // Family Numbers
  "home_and_family_background.number_of_children_in_the_family_including_yourself":
    [
      { required: true, message: messages.required },
      { pattern: patterns.numeric, message: messages.invalidNumber },
      { min: 1, message: messages.minValue(1) },
      { max: 50, message: messages.maxValue(50) },
      { sanitize: sanitizeNumber, message: "Number sanitized" },
    ],
  "home_and_family_background.number_of_brothers": [
    { required: true, message: messages.required },
    { pattern: patterns.numeric, message: messages.invalidNumber },
    { min: 0, message: messages.minValue(0) },
    { max: 49, message: messages.maxValue(49) },
    { sanitize: sanitizeNumber, message: "Number sanitized" },
  ],
  "home_and_family_background.number_of_sisters": [
    { required: true, message: messages.required },
    { pattern: patterns.numeric, message: messages.invalidNumber },
    { min: 0, message: messages.minValue(0) },
    { max: 49, message: messages.maxValue(49) },
    { sanitize: sanitizeNumber, message: "Number sanitized" },
  ],
  "home_and_family_background.number_of_brothers_or_sisters_employed": [
    { required: true, message: messages.required },
    { pattern: patterns.numeric, message: messages.invalidNumber },
    { min: 0, message: messages.minValue(0) },
    { sanitize: sanitizeNumber, message: "Number sanitized" },
  ],
  "home_and_family_background.how_much_is_your_weekly_allowance": [
    { required: true, message: messages.required },
    { pattern: patterns.numeric, message: messages.invalidNumber },
    { min: 0, message: messages.minValue(0) },
    { sanitize: sanitizeNumber, message: "Number sanitized" },
  ],

  // Signature
  student_signature: [
    { required: true, message: messages.required },
    { minLength: 5, message: messages.minLength(5) },
    { maxLength: 100, message: messages.maxLength(100) },
    { sanitize: sanitizeName, message: "Name sanitized" },
  ],
};

/**
 * Sanitizes form data before submission
 * Applies field-specific sanitization based on validation rules
 */
export const sanitizeFormData = <T extends Record<string, unknown>>(
  formData: T,
  validationRules: ValidationRules,
): T => {
  const sanitized = { ...formData };

  Object.keys(validationRules).forEach((fieldKey) => {
    const rules = validationRules[fieldKey];
    const value = getNestedValue(sanitized, fieldKey);

    if (typeof value === "string" && value) {
      // Find sanitize function in rules
      const sanitizeRule = rules.find((rule) => rule.sanitize);
      if (sanitizeRule && sanitizeRule.sanitize) {
        const sanitizedValue = sanitizeRule.sanitize(value);
        setNestedValue(sanitized, fieldKey, sanitizedValue);
      }
    }
  });

  return sanitized;
};

/**
 * Helper to set nested object value by dot notation
 */
const setNestedValue = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void => {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
};

// Real-time validation helper
export const createFieldValidator = (rules: ValidationRule[]) => {
  return (value: string): string | null => {
    return validateField(value, rules);
  };
};

// Check if form has any errors
export const hasErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

// Get error message for a specific field
export const getFieldError = (
  errors: Record<string, string>,
  fieldKey: string,
): string | undefined => {
  return errors[fieldKey];
};
