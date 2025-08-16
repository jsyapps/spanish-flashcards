import AsyncStorage from '@react-native-async-storage/async-storage';

// Rate limit configuration
export const RATE_LIMITS = {
  BURST: {
    requests: 3,
    windowMs: 10 * 1000, // 10 seconds
  },
  SHORT_TERM: {
    requests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  DAILY: {
    requests: 100,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const;

interface RequestLog {
  timestamp: number;
  endpoint: string;
}

interface RateLimitData {
  requests: RequestLog[];
  dailyResetTimestamp: number;
}

interface RateLimitStatus {
  canMakeRequest: boolean;
  limitType?: 'burst' | 'short_term' | 'daily';
  remainingRequests: {
    burst: number;
    shortTerm: number;
    daily: number;
  };
  resetTimes: {
    burst: number;
    shortTerm: number;
    daily: number;
  };
  nextResetTime: number;
}

export interface RateLimitError extends Error {
  limitType: 'burst' | 'short_term' | 'daily';
  resetTime: number;
  remainingTime: number;
}

class RateLimitStorage {
  private readonly storageKey = 'rate_limit_data';
  private cache: RateLimitData | null = null;

  private async loadData(): Promise<RateLimitData> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored) as RateLimitData;
        this.cache = data;
        return data;
      }
    } catch (error) {
      console.warn('Failed to load rate limit data:', error);
    }

    // Initialize with empty data
    const now = Date.now();
    const initialData: RateLimitData = {
      requests: [],
      dailyResetTimestamp: now + RATE_LIMITS.DAILY.windowMs,
    };
    
    this.cache = initialData;
    await this.saveData(initialData);
    return initialData;
  }

  private async saveData(data: RateLimitData): Promise<void> {
    try {
      this.cache = data;
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save rate limit data:', error);
    }
  }

  private cleanOldRequests(requests: RequestLog[], windowMs: number): RequestLog[] {
    const cutoff = Date.now() - windowMs;
    return requests.filter(req => req.timestamp > cutoff);
  }

  private getNextResetTime(requests: RequestLog[], windowMs: number): number {
    if (requests.length === 0) return 0;
    const oldestRequest = Math.min(...requests.map(r => r.timestamp));
    return oldestRequest + windowMs;
  }

  async checkRateLimit(endpoint: string = '/chat'): Promise<RateLimitStatus> {
    const data = await this.loadData();
    const now = Date.now();

    // Check if daily limit has reset
    if (now >= data.dailyResetTimestamp) {
      data.requests = [];
      data.dailyResetTimestamp = now + RATE_LIMITS.DAILY.windowMs;
      await this.saveData(data);
    }

    // Clean old requests
    const cleanRequests = this.cleanOldRequests(data.requests, RATE_LIMITS.DAILY.windowMs);
    
    // Get requests for each time window
    const burstRequests = this.cleanOldRequests(cleanRequests, RATE_LIMITS.BURST.windowMs);
    const shortTermRequests = this.cleanOldRequests(cleanRequests, RATE_LIMITS.SHORT_TERM.windowMs);
    const dailyRequests = cleanRequests;

    // Calculate remaining requests
    const remainingRequests = {
      burst: Math.max(0, RATE_LIMITS.BURST.requests - burstRequests.length),
      shortTerm: Math.max(0, RATE_LIMITS.SHORT_TERM.requests - shortTermRequests.length),
      daily: Math.max(0, RATE_LIMITS.DAILY.requests - dailyRequests.length),
    };

    // Calculate reset times
    const resetTimes = {
      burst: this.getNextResetTime(burstRequests, RATE_LIMITS.BURST.windowMs),
      shortTerm: this.getNextResetTime(shortTermRequests, RATE_LIMITS.SHORT_TERM.windowMs),
      daily: data.dailyResetTimestamp,
    };

    // Check limits in order of severity
    let canMakeRequest = true;
    let limitType: 'burst' | 'short_term' | 'daily' | undefined;
    let nextResetTime = 0;

    if (burstRequests.length >= RATE_LIMITS.BURST.requests) {
      canMakeRequest = false;
      limitType = 'burst';
      nextResetTime = resetTimes.burst;
    } else if (shortTermRequests.length >= RATE_LIMITS.SHORT_TERM.requests) {
      canMakeRequest = false;
      limitType = 'short_term';
      nextResetTime = resetTimes.shortTerm;
    } else if (dailyRequests.length >= RATE_LIMITS.DAILY.requests) {
      canMakeRequest = false;
      limitType = 'daily';
      nextResetTime = resetTimes.daily;
    }

    return {
      canMakeRequest,
      limitType,
      remainingRequests,
      resetTimes,
      nextResetTime: nextResetTime || Math.min(resetTimes.burst, resetTimes.shortTerm, resetTimes.daily),
    };
  }

  async recordRequest(endpoint: string = '/chat'): Promise<void> {
    const data = await this.loadData();
    const now = Date.now();

    // Add new request
    data.requests.push({
      timestamp: now,
      endpoint,
    });

    // Clean old requests to keep storage size manageable
    data.requests = this.cleanOldRequests(data.requests, RATE_LIMITS.DAILY.windowMs);

    await this.saveData(data);
  }

  async getRateLimitStatus(): Promise<RateLimitStatus> {
    return this.checkRateLimit();
  }

  async clearRateLimitData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      this.cache = null;
    } catch (error) {
      console.error('Failed to clear rate limit data:', error);
    }
  }

  // Get usage analytics
  async getUsageStats(): Promise<{
    totalRequestsToday: number;
    requestsInLastHour: number;
    requestsInLastMinute: number;
    averageRequestsPerDay: number;
  }> {
    const data = await this.loadData();
    const now = Date.now();
    
    const oneHour = 60 * 60 * 1000;
    const oneMinute = 60 * 1000;
    
    const todayRequests = this.cleanOldRequests(data.requests, RATE_LIMITS.DAILY.windowMs);
    const hourRequests = this.cleanOldRequests(data.requests, oneHour);
    const minuteRequests = this.cleanOldRequests(data.requests, oneMinute);
    
    // Calculate average based on request history
    const oldestRequest = data.requests.length > 0 ? Math.min(...data.requests.map(r => r.timestamp)) : now;
    const daysSinceFirstRequest = Math.max(1, (now - oldestRequest) / RATE_LIMITS.DAILY.windowMs);
    const averageRequestsPerDay = data.requests.length / daysSinceFirstRequest;
    
    return {
      totalRequestsToday: todayRequests.length,
      requestsInLastHour: hourRequests.length,
      requestsInLastMinute: minuteRequests.length,
      averageRequestsPerDay: Math.round(averageRequestsPerDay * 100) / 100,
    };
  }

  // Format time remaining for user display
  formatTimeRemaining(resetTime: number): string {
    const now = Date.now();
    const remaining = Math.max(0, resetTime - now);
    
    if (remaining === 0) return 'Now available';
    
    const seconds = Math.ceil(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    } else if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// Create singleton instance
export const rateLimitStorage = new RateLimitStorage();

// Export types
export type { RateLimitStatus, RateLimitData, RequestLog };