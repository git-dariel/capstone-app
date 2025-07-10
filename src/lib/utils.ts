import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to create acronyms from long program names
export function createAcronym(text: string): string {
  // Handle common program name patterns
  const words = text.split(" ");

  // Special handling for common academic terms
  const skipWords = new Set(["in", "of", "and", "the", "for", "with", "on"]);
  const importantWords = words.filter((word) => !skipWords.has(word.toLowerCase()));

  // If we have 4 or fewer important words, use first letter of each
  if (importantWords.length <= 4) {
    return importantWords.map((word) => word.charAt(0).toUpperCase()).join("");
  }

  // For longer names, be more selective
  // Take first letter of first 3 words and last word
  if (importantWords.length > 4) {
    const firstThree = importantWords.slice(0, 3);
    const lastOne = importantWords[importantWords.length - 1];
    return [...firstThree, lastOne].map((word) => word.charAt(0).toUpperCase()).join("");
  }

  return importantWords.map((word) => word.charAt(0).toUpperCase()).join("");
}

// Utility function to get display name for programs
export function getDisplayProgramName(programName: string, maxLength = 25): string {
  if (programName.length <= maxLength) {
    return programName;
  }

  // Create acronym for very long names
  const acronym = createAcronym(programName);

  // If acronym is reasonable length, use it with original in parentheses (truncated)
  if (acronym.length <= 6) {
    const truncated = programName.length > 15 ? programName.substring(0, 15) + "..." : programName;
    return `${acronym} (${truncated})`;
  }

  // Fallback: just truncate
  return programName.substring(0, maxLength - 3) + "...";
}

// Utility function to truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}
