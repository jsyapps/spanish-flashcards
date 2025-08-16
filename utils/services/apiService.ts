import Constants from 'expo-constants';
import { rateLimitStorage, RateLimitError, RateLimitStatus } from '../storage/rateLimitStorage';

interface ChatResponse {
  response: string;
}

interface ChatRequest {
  message: string;
}

interface ApiError extends Error {
  status?: number;
}

class ApiService {
  private readonly baseUrl = 'https://spanish-flashcards-api.vercel.app/api';
  private readonly timeout = 10000; // 10 seconds timeout
  private readonly apiKey: string;

  constructor() {
    // Get API key from Expo config
    this.apiKey = Constants.expoConfig?.extra?.apiKey;
    
    if (!this.apiKey) {
      throw new Error('API key not found in configuration');
    }
  }

  // Check rate limits before making requests
  private async checkRateLimit(endpoint: string): Promise<void> {
    const status = await rateLimitStorage.checkRateLimit(endpoint);
    
    if (!status.canMakeRequest) {
      const error = new Error(this.getRateLimitErrorMessage(status)) as RateLimitError;
      error.limitType = status.limitType!;
      error.resetTime = status.nextResetTime;
      error.remainingTime = Math.max(0, status.nextResetTime - Date.now());
      error.name = 'RateLimitError';
      throw error;
    }
  }

  // Generate user-friendly rate limit error messages
  private getRateLimitErrorMessage(status: RateLimitStatus): string {
    const timeRemaining = rateLimitStorage.formatTimeRemaining(status.nextResetTime);
    
    switch (status.limitType) {
      case 'burst':
        return `Too many requests in a short time. Please wait ${timeRemaining} before trying again.`;
      case 'short_term':
        return `Rate limit exceeded. You can make ${status.remainingRequests.daily} more requests today. Please wait ${timeRemaining} before trying again.`;
      case 'daily':
        return `Daily limit of 100 requests reached. Your quota will reset ${timeRemaining}.`;
      default:
        return `Rate limit exceeded. Please wait ${timeRemaining} before trying again.`;
    }
  }

  // Get current rate limit status
  async getRateLimitStatus(): Promise<RateLimitStatus> {
    return rateLimitStorage.getRateLimitStatus();
  }

  // Get usage statistics
  async getUsageStats() {
    return rateLimitStorage.getUsageStats();
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Check rate limits before making the request
    await this.checkRateLimit(endpoint);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new Error(`API request failed: ${response.statusText}`) as ApiError;
        error.status = response.status;
        throw error;
      }

      // Record successful request for rate limiting
      await rateLimitStorage.recordRequest(endpoint);

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        }
        // Don't record failed requests due to rate limiting
        if (error.name !== 'RateLimitError') {
          // Record failed requests for other reasons (network, server errors, etc.)
          // This helps prevent retry storms while tracking actual usage
          await rateLimitStorage.recordRequest(endpoint);
        }
        throw error;
      }
      
      throw new Error('An unexpected error occurred');
    }
  }

  async sendChatMessage(message: string): Promise<ChatResponse> {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    const requestBody: ChatRequest = {
      message: message.trim(),
    };

    try {
      return await this.makeRequest<ChatResponse>('/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      // Log error for debugging (in production, consider using a proper logging service)
      console.error('Chat API Error:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to get response: ${error.message}`);
      }
      
      throw new Error('Sorry, I couldn\'t get a response. Please try again.');
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type { ChatResponse, ChatRequest, ApiError };