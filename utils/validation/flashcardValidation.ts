export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateFlashcardInput = (front: string, back: string): ValidationResult => {
  const errors: string[] = [];

  // Trim inputs
  const trimmedFront = front.trim();
  const trimmedBack = back.trim();

  // Check required fields
  if (!trimmedFront) {
    errors.push('Front text is required');
  }

  if (!trimmedBack) {
    errors.push('Back text is required');
  }

  // Check length limits
  if (trimmedFront.length > 500) {
    errors.push('Front text must be 500 characters or less');
  }

  if (trimmedBack.length > 2000) {
    errors.push('Back text must be 2000 characters or less');
  }

  // Check for minimum length
  if (trimmedFront.length > 0 && trimmedFront.length < 2) {
    errors.push('Front text must be at least 2 characters');
  }

  if (trimmedBack.length > 0 && trimmedBack.length < 2) {
    errors.push('Back text must be at least 2 characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateDeckInput = (name: string, description?: string): ValidationResult => {
  const errors: string[] = [];

  // Trim inputs
  const trimmedName = name.trim();
  const trimmedDescription = description?.trim();

  // Check required fields
  if (!trimmedName) {
    errors.push('Deck name is required');
  }

  // Check length limits
  if (trimmedName.length > 100) {
    errors.push('Deck name must be 100 characters or less');
  }

  if (trimmedDescription && trimmedDescription.length > 500) {
    errors.push('Deck description must be 500 characters or less');
  }

  // Check for minimum length
  if (trimmedName.length > 0 && trimmedName.length < 2) {
    errors.push('Deck name must be at least 2 characters');
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(trimmedName)) {
    errors.push('Deck name contains invalid characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};