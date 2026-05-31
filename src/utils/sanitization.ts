// XSS Protection and Input Sanitization Utility

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes HTML tags, scripts, and dangerous characters
 */

// List of dangerous HTML tags that should be blocked
const DANGEROUS_TAGS = [
  "script",
  "iframe",
  "object",
  "embed",
  "link",
  "style",
  "meta",
  "base",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "img",
  "video",
  "audio",
  "source",
  "track",
  "canvas",
  "svg",
  "math",
];

// List of dangerous event handlers
const DANGEROUS_EVENTS = [
  "onload",
  "onerror",
  "onclick",
  "onmouseover",
  "onmouseout",
  "onmousemove",
  "onmouseenter",
  "onmouseleave",
  "onfocus",
  "onblur",
  "onchange",
  "onsubmit",
  "onkeydown",
  "onkeyup",
  "onkeypress",
  "ondblclick",
  "oncontextmenu",
  "oninput",
  "onpaste",
  "oncopy",
  "oncut",
  "ondrag",
  "ondrop",
];

// List of dangerous protocols
const DANGEROUS_PROTOCOLS = [
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
  "about:",
];

/**
 * Escapes HTML special characters to prevent XSS
 */
export const escapeHtml = (input: string): string => {
  if (!input) return "";

  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
};

/**
 * Removes all HTML tags from input
 */
export const stripHtmlTags = (input: string): string => {
  if (!input) return "";

  // Remove all HTML tags
  return input.replace(/<[^>]*>/g, "");
};

/**
 * Sanitizes input by removing dangerous content
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  let sanitized = input;

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Remove HTML tags
  sanitized = stripHtmlTags(sanitized);

  // Remove dangerous protocols
  DANGEROUS_PROTOCOLS.forEach((protocol) => {
    const regex = new RegExp(protocol, "gi");
    sanitized = sanitized.replace(regex, "");
  });

  // Remove event handlers
  DANGEROUS_EVENTS.forEach((event) => {
    const regex = new RegExp(event, "gi");
    sanitized = sanitized.replace(regex, "");
  });

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

/**
 * Deep sanitizes an object recursively
 */
export const sanitizeObject = <T extends Record<string, unknown>>(
  obj: T,
): T => {
  const sanitized = { ...obj } as Record<string, unknown>;

  Object.keys(sanitized).forEach((key) => {
    const value = sanitized[key];

    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (typeof item === "string") {
          return sanitizeInput(item);
        } else if (item && typeof item === "object") {
          return sanitizeObject(item as Record<string, unknown>);
        }
        return item;
      });
    }
  });

  return sanitized as T;
};

/**
 * Checks if input contains dangerous content
 */
export const containsDangerousContent = (input: string): boolean => {
  if (!input) return false;

  const lowerInput = input.toLowerCase();

  // Check for HTML tags
  if (/<[^>]*>/g.test(input)) {
    return true;
  }

  // Check for dangerous tags
  for (const tag of DANGEROUS_TAGS) {
    if (lowerInput.includes(`<${tag}`)) {
      return true;
    }
  }

  // Check for dangerous protocols
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (lowerInput.includes(protocol)) {
      return true;
    }
  }

  // Check for event handlers
  for (const event of DANGEROUS_EVENTS) {
    if (lowerInput.includes(event)) {
      return true;
    }
  }

  // Check for encoded scripts
  if (
    lowerInput.includes("&#") ||
    lowerInput.includes("\\x") ||
    lowerInput.includes("\\u")
  ) {
    // Might be encoded HTML entities or unicode that could be dangerous
    const decoded = decodeURIComponent(input);
    if (decoded !== input && containsDangerousContent(decoded)) {
      return true;
    }
  }

  return false;
};

/**
 * Validates that input doesn't contain XSS attempts
 */
export const validateNoXSS = (
  input: string,
): {
  isValid: boolean;
  message?: string;
} => {
  if (!input) {
    return { isValid: true };
  }

  if (containsDangerousContent(input)) {
    return {
      isValid: false,
      message:
        "Input contains potentially dangerous content. HTML tags and scripts are not allowed.",
    };
  }

  return { isValid: true };
};

/**
 * Sanitizes SQL input to prevent SQL injection
 * Note: This is a basic client-side check. Always use parameterized queries on backend!
 */
export const sanitizeSqlInput = (input: string): string => {
  if (!input) return "";

  let sanitized = input;

  // Remove SQL comment markers
  sanitized = sanitized.replace(/--/g, "");
  sanitized = sanitized.replace(/\/\*/g, "");
  sanitized = sanitized.replace(/\*\//g, "");

  // Remove semicolons (statement terminators)
  sanitized = sanitized.replace(/;/g, "");

  // Escape single quotes
  sanitized = sanitized.replace(/'/g, "''");

  return sanitized;
};

/**
 * Checks if input contains SQL injection attempts
 */
export const containsSqlInjection = (input: string): boolean => {
  if (!input) return false;

  const lowerInput = input.toLowerCase();

  // Common SQL injection patterns
  const sqlPatterns = [
    /(\bor\b|\band\b)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i, // OR 1=1, AND 1=1
    /\bunion\b.*\bselect\b/i, // UNION SELECT
    /\bdrop\b.*\btable\b/i, // DROP TABLE
    /\binsert\b.*\binto\b/i, // INSERT INTO
    /\bdelete\b.*\bfrom\b/i, // DELETE FROM
    /\bupdate\b.*\bset\b/i, // UPDATE SET
    /\bexec\b.*\(/i, // EXEC(
    /\bexecute\b.*\(/i, // EXECUTE(
    /\bselect\b.*\bfrom\b/i, // SELECT FROM
    /--/i, // SQL comments
    /\/\*/i, // Multi-line comment start
    /\*\//i, // Multi-line comment end
    /\bxp_/i, // Extended stored procedures
    /\bsp_/i, // System stored procedures
    /\bchar\s*\(/i, // CHAR function
    /\bcast\s*\(/i, // CAST function
    /\bconcat\s*\(/i, // CONCAT function
  ];

  return sqlPatterns.some((pattern) => pattern.test(lowerInput));
};

/**
 * Validates that input doesn't contain SQL injection attempts
 */
export const validateNoSqlInjection = (
  input: string,
): {
  isValid: boolean;
  message?: string;
} => {
  if (!input) {
    return { isValid: true };
  }

  if (containsSqlInjection(input)) {
    return {
      isValid: false,
      message: "Input contains potentially dangerous SQL patterns.",
    };
  }

  return { isValid: true };
};

/**
 * Comprehensive sanitization for all user inputs
 * Combines XSS and SQL injection prevention
 */
export const sanitizeUserInput = (input: string): string => {
  if (!input) return "";

  // First sanitize XSS
  const sanitized = sanitizeInput(input);

  // Then sanitize SQL (but preserve necessary characters for normal text)
  // We only remove obvious SQL injection patterns, not all SQL-like syntax
  // since users might legitimately type things like "I'm happy" (contains ')

  return sanitized;
};

/**
 * Comprehensive validation for all user inputs
 */
export const validateUserInput = (
  input: string,
): {
  isValid: boolean;
  message?: string;
} => {
  if (!input) {
    return { isValid: true };
  }

  // Check for XSS
  const xssCheck = validateNoXSS(input);
  if (!xssCheck.isValid) {
    return xssCheck;
  }

  // Check for SQL injection
  const sqlCheck = validateNoSqlInjection(input);
  if (!sqlCheck.isValid) {
    return sqlCheck;
  }

  return { isValid: true };
};

/**
 * Safe string for display in React components
 * Escapes HTML but preserves the string for display
 */
export const safeString = (input: string): string => {
  if (!input) return "";
  return escapeHtml(input);
};

/**
 * Allowed characters validator
 * Returns only alphanumeric, spaces, and safe punctuation
 */
export const getAllowedCharactersOnly = (
  input: string,
  additionalAllowed: string = "",
): string => {
  if (!input) return "";

  // Base allowed: letters, numbers, spaces, basic punctuation
  const basePattern = "a-zA-Z0-9\\s.,!?-'";
  const pattern = new RegExp(`[^${basePattern}${additionalAllowed}]`, "g");

  return input.replace(pattern, "");
};

/**
 * Phone number sanitization - removes all non-numeric except + and -
 */
export const sanitizePhoneNumber = (input: string): string => {
  if (!input) return "";
  return input.replace(/[^0-9+\s()-]/g, "");
};

/**
 * Email sanitization - basic cleanup
 */
export const sanitizeEmail = (input: string): string => {
  if (!input) return "";

  // Remove whitespace
  let sanitized = input.trim();

  // Convert to lowercase
  sanitized = sanitized.toLowerCase();

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>"']/g, "");

  return sanitized;
};

/**
 * Name sanitization - allows only letters, spaces, hyphens, apostrophes
 */
export const sanitizeName = (input: string): string => {
  if (!input) return "";

  // Remove HTML
  let sanitized = stripHtmlTags(input);

  // Allow only letters, spaces, hyphens, apostrophes, and accented characters
  sanitized = sanitized.replace(/[^a-zA-Z\s\u00C0-\u017F'-]/g, "");

  // Remove multiple spaces
  sanitized = sanitized.replace(/\s+/g, " ");

  // Trim
  sanitized = sanitized.trim();

  return sanitized;
};

/**
 * Number sanitization - removes non-numeric characters
 */
export const sanitizeNumber = (input: string): string => {
  if (!input) return "";
  return input.replace(/[^0-9]/g, "");
};

/**
 * Decimal number sanitization - allows numbers and decimal point
 */
export const sanitizeDecimal = (input: string): string => {
  if (!input) return "";
  return input.replace(/[^0-9.]/g, "");
};

/**
 * Address sanitization - allows alphanumeric and common address characters
 */
export const sanitizeAddress = (input: string): string => {
  if (!input) return "";

  // Remove HTML
  let sanitized = stripHtmlTags(input);

  // Allow letters, numbers, spaces, and common address punctuation
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s.,\-#/]/g, "");

  // Remove multiple spaces
  sanitized = sanitized.replace(/\s+/g, " ");

  // Trim
  sanitized = sanitized.trim();

  return sanitized;
};

// Export all utilities
export default {
  escapeHtml,
  stripHtmlTags,
  sanitizeInput,
  sanitizeObject,
  containsDangerousContent,
  validateNoXSS,
  sanitizeSqlInput,
  containsSqlInjection,
  validateNoSqlInjection,
  sanitizeUserInput,
  validateUserInput,
  safeString,
  getAllowedCharactersOnly,
  sanitizePhoneNumber,
  sanitizeEmail,
  sanitizeName,
  sanitizeNumber,
  sanitizeDecimal,
  sanitizeAddress,
};
