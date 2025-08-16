export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, operation: string) {
    super(
      `Storage operation failed: ${operation} - ${message}`,
      'STORAGE_ERROR',
      'Unable to save or retrieve data. Please try again.'
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    const userMessage = field 
      ? `Invalid ${field}: ${message}` 
      : `Validation failed: ${message}`;
    
    super(message, 'VALIDATION_ERROR', userMessage);
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(
      `Network request failed: ${message}`,
      'NETWORK_ERROR',
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }
}

export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in ${context}:`, error);
    
    throw new AppError(
      `${context} failed: ${errorMessage}`,
      'UNKNOWN_ERROR',
      'An unexpected error occurred. Please try again.'
    );
  }
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError && error.userMessage) {
    return error.userMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};