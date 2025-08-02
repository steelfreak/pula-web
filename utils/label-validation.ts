export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  validate: (label: string) => boolean;
  severity: "error" | "warning" | "info";
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationRule[];
  warnings: ValidationRule[];
  info: ValidationRule[];
  score: number; // 0-100 quality score
}

export const labelValidationRules: ValidationRule[] = [
  {
    id: "min-length",
    name: "Minimum Length",
    description: "Label must be at least 10 characters long",
    validate: (label: string) => label.trim().length >= 10,
    severity: "error",
    message: "Label must be at least 10 characters long",
  },
  {
    id: "max-length",
    name: "Maximum Length",
    description: "Label should not exceed 500 characters",
    validate: (label: string) => label.trim().length <= 500,
    severity: "error",
    message: "Label must not exceed 500 characters",
  },
  {
    id: "no-empty",
    name: "Not Empty",
    description: "Label cannot be empty or only whitespace",
    validate: (label: string) => label.trim().length > 0,
    severity: "error",
    message: "Label cannot be empty",
  },
  {
    id: "starts-capital",
    name: "Proper Capitalization",
    description: "Label should start with a capital letter",
    validate: (label: string) => /^[A-Z]/.test(label.trim()),
    severity: "warning",
    message: "Label should start with a capital letter",
  },
  {
    id: "ends-period",
    name: "Proper Punctuation",
    description: "Label should end with proper punctuation",
    validate: (label: string) => /[.!?]$/.test(label.trim()),
    severity: "warning",
    message:
      "Label should end with a period, exclamation mark, or question mark",
  },
  {
    id: "no-profanity",
    name: "No Profanity",
    description: "Label should not contain inappropriate language",
    validate: (label: string) => {
      const profanityWords = ["damn", "hell", "stupid", "idiot"]; // Basic list
      const lowerLabel = label.toLowerCase();
      return !profanityWords.some((word) => lowerLabel.includes(word));
    },
    severity: "error",
    message: "Label contains inappropriate language",
  },
  {
    id: "descriptive",
    name: "Descriptive Content",
    description: "Label should be descriptive and informative",
    validate: (label: string) => {
      const words = label.trim().split(/\s+/);
      return words.length >= 3; // At least 3 words for descriptiveness
    },
    severity: "warning",
    message: "Label should be more descriptive (at least 3 words)",
  },
  {
    id: "no-repetition",
    name: "No Word Repetition",
    description: "Label should not repeat the same word multiple times",
    validate: (label: string) => {
      const words = label.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      return uniqueWords.size >= words.length * 0.8; // Allow some repetition
    },
    severity: "info",
    message: "Consider reducing word repetition for clarity",
  },
  {
    id: "complete-sentence",
    name: "Complete Sentence",
    description: "Label should form a complete sentence or phrase",
    validate: (label: string) => {
      const trimmed = label.trim();
      return (
        trimmed.includes(" ") &&
        (trimmed.includes("is") ||
          trimmed.includes("are") ||
          trimmed.includes("refers") ||
          trimmed.length > 20)
      );
    },
    severity: "info",
    message: "Consider making the label a complete sentence for better clarity",
  },
];

export function validateLabel(label: string): ValidationResult {
  const errors: ValidationRule[] = [];
  const warnings: ValidationRule[] = [];
  const info: ValidationRule[] = [];

  labelValidationRules.forEach((rule) => {
    if (!rule.validate(label)) {
      switch (rule.severity) {
        case "error":
          errors.push(rule);
          break;
        case "warning":
          warnings.push(rule);
          break;
        case "info":
          info.push(rule);
          break;
      }
    }
  });

  // Calculate quality score
  const totalRules = labelValidationRules.length;
  const passedRules =
    totalRules - errors.length - warnings.length - info.length;
  const score = Math.round((passedRules / totalRules) * 100);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
    score,
  };
}

export function getQualityColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function getQualityBadgeColor(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-800";
  if (score >= 60) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

/**
 * Generate audio filename in the format: {LexemeId}-{destinationLanguageCode}-{label}audio.ogg
 * @param lexemeId - The lexeme ID (e.g., "L3625")
 * @param destinationLanguageCode - The destination language code (e.g., "de")
 * @param label - The label/word being recorded (e.g., "Mutter")
 * @returns Formatted filename (e.g., "L3625-de-Mutteraudio.ogg")
 */
export function generateAudioFilename(
  lexemeId: string,
  destinationLanguageCode: string,
  label: string
): string {
  const cleanLexemeId = lexemeId.trim();
  const cleanLanguageCode = destinationLanguageCode.trim().toLowerCase();
  const cleanLabel = label
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "");

  const filename = `${cleanLexemeId}-${cleanLanguageCode}-${cleanLabel}.ogg`;
  return filename;
}
