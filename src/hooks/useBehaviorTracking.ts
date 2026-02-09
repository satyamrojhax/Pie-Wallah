import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackUserBehavior } from '@/services/realtimeDatabaseService';

interface UseBehaviorTrackingOptions {
  userId: string;
  trackPageViews?: boolean;
  trackInteractions?: boolean;
  customData?: any;
}

export const useBehaviorTracking = ({
  userId,
  trackPageViews = true,
  trackInteractions = true,
  customData = {},
}: UseBehaviorTrackingOptions) => {
  const location = useLocation();
  const lastTrackedPath = useRef<string>('');
  const sessionStartTime = useRef<number>(Date.now());

  // Track page views
  useEffect(() => {
    if (!userId || !trackPageViews) return;

    const currentPath = location.pathname + location.search;
    
    // Only track if path has changed
    if (currentPath !== lastTrackedPath.current) {
      trackPageView(userId, currentPath);
      lastTrackedPath.current = currentPath;
    }
  }, [location, userId, trackPageViews]);

  // Track user interactions
  useEffect(() => {
    if (!userId || !trackInteractions) return;

    const handleInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      const elementType = target.tagName.toLowerCase();
      const elementId = target.id;
      const elementClass = target.className;
      
      // Get meaningful text content or use element type
      let elementText = '';
      if (target.textContent && target.textContent.trim().length > 0) {
        elementText = target.textContent.trim().substring(0, 100);
      } else if (target.getAttribute('aria-label')) {
        elementText = target.getAttribute('aria-label')!;
      } else if (target.getAttribute('alt')) {
        elementText = target.getAttribute('alt')!;
      } else {
        elementText = elementType;
      }

      trackUserBehavior(userId, 'element_interaction', location.pathname, {
        elementType,
        elementId: elementId || undefined,
        elementClass: elementClass || undefined,
        elementText,
        timestamp: Date.now(),
        ...customData,
      });
    };

    // Track clicks
    const handleClick = (event: MouseEvent) => {
      handleInteraction(event);
    };

    // Track form submissions
    const handleSubmit = (event: Event) => {
      const target = event.target as HTMLFormElement;
      trackUserBehavior(userId, 'form_submit', location.pathname, {
        formId: target.id,
        formClass: target.className,
        timestamp: Date.now(),
        ...customData,
      });
    };

    // Track scroll events (throttled)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        trackUserBehavior(userId, 'scroll', location.pathname, {
          scrollPercentage,
          scrollY: window.scrollY,
          timestamp: Date.now(),
          ...customData,
        });
      }, 1000);
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [userId, trackInteractions, location.pathname, customData]);

  // Track session duration
  useEffect(() => {
    if (!userId) return;

    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - sessionStartTime.current;
      trackUserBehavior(userId, 'session_duration', location.pathname, {
        duration: sessionDuration,
        timestamp: Date.now(),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, location.pathname]);

  // Track visibility changes (tab focus/blur)
  useEffect(() => {
    if (!userId) return;

    const handleVisibilityChange = () => {
      trackUserBehavior(userId, document.hidden ? 'tab_blur' : 'tab_focus', location.pathname, {
        timestamp: Date.now(),
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, location.pathname]);

  // Track errors
  useEffect(() => {
    if (!userId) return;

    const handleError = (event: ErrorEvent) => {
      trackUserBehavior(userId, 'error', location.pathname, {
        errorMessage: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackUserBehavior(userId, 'unhandled_rejection', location.pathname, {
        reason: event.reason,
        timestamp: Date.now(),
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [userId, location.pathname]);
};

// Custom hook for tracking specific component interactions
export const useComponentTracking = (userId: string, componentName: string, customData: any = {}) => {
  const trackComponentInteraction = (action: string, data?: any) => {
    if (!userId) return;
    
    trackUserBehavior(userId, `component_${action}`, componentName, {
      componentName,
      ...customData,
      ...data,
      timestamp: Date.now(),
    });
  };

  const trackComponentView = () => {
    if (!userId) return;
    
    trackUserBehavior(userId, 'component_view', componentName, {
      componentName,
      ...customData,
      timestamp: Date.now(),
    });
  };

  const trackComponentError = (error: Error, additionalData?: any) => {
    if (!userId) return;
    
    trackUserBehavior(userId, 'component_error', componentName, {
      componentName,
      errorMessage: error.message,
      errorStack: error.stack,
      ...customData,
      ...additionalData,
      timestamp: Date.now(),
    });
  };

  return {
    trackComponentInteraction,
    trackComponentView,
    trackComponentError,
  };
};

// Hook for tracking form interactions
export const useFormTracking = (userId: string, formName: string, customData: any = {}) => {
  const trackFormStart = () => {
    if (!userId) return;
    
    trackUserBehavior(userId, 'form_start', formName, {
      formName,
      ...customData,
      timestamp: Date.now(),
    });
  };

  const trackFieldChange = (fieldName: string, value: any) => {
    if (!userId) return;
    
    trackUserBehavior(userId, 'form_field_change', formName, {
      formName,
      fieldName,
      fieldType: typeof value,
      ...customData,
      timestamp: Date.now(),
    });
  };

  const trackFormSubmit = (formData: any) => {
    if (!userId) return;
    
    trackUserBehavior(userId, 'form_submit_attempt', formName, {
      formName,
      fieldCount: Object.keys(formData).length,
      ...customData,
      timestamp: Date.now(),
    });
  };

  const trackFormSuccess = (response?: any) => {
    if (!userId) return;
    
    trackUserBehavior(userId, 'form_submit_success', formName, {
      formName,
      ...customData,
      response,
      timestamp: Date.now(),
    });
  };

  const trackFormError = (error: Error) => {
    if (!userId) return;
    
    trackUserBehavior(userId, 'form_submit_error', formName, {
      formName,
      errorMessage: error.message,
      ...customData,
      timestamp: Date.now(),
    });
  };

  return {
    trackFormStart,
    trackFieldChange,
    trackFormSubmit,
    trackFormSuccess,
    trackFormError,
  };
};
