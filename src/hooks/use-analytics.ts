'use client';

import { useAuthData } from '@/contexts/AuthContext';
import { logAnalyticsEvent, AnalyticsLog, AnalyticsEventType, updateSessionStats } from '@/lib/services/analyticsService';

/**
 * Hook to track behavioral events with session context.
 */
export function useAnalytics() {
  const trackEvent = (eventType: AnalyticsEventType, data?: Partial<AnalyticsLog>) => {
    // API-based tracking could be implemented here
    // console.log('Event tracked:', eventType, data);
  };

  return { trackEvent };
}
