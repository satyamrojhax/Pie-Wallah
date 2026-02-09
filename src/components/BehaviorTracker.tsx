import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';

interface BehaviorTrackerProps {
  userId: string;
  children: React.ReactNode;
  trackPageViews?: boolean;
  trackInteractions?: boolean;
  customData?: any;
}

export const BehaviorTracker: React.FC<BehaviorTrackerProps> = ({
  userId,
  children,
  trackPageViews = true,
  trackInteractions = true,
  customData = {},
}) => {
  const location = useLocation();

  useBehaviorTracking({
    userId,
    trackPageViews,
    trackInteractions,
    customData,
  });

  return <>{children}</>;
};

export default BehaviorTracker;
