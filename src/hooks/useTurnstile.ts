import { useCallback, useEffect, useRef, useState } from 'react';

import type { TurnstileWidgetOptions } from '$types/turnstile';

declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        options: TurnstileWidgetOptions & { sitekey: string }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface UseTurnstileOptions {
  sitekey: string;
  options?: TurnstileWidgetOptions;
}

const useTurnstile = ({ sitekey, options }: UseTurnstileOptions) => {
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const [isTurnstileScriptReady, setIsTurnstileScriptReady] = useState(false);

  const checkTurnstileScript = useCallback(() => {
    return typeof window !== 'undefined' && window.turnstile !== undefined;
  }, []);

  useEffect(() => {
    let pollingInterval: number | undefined;

    const attemptRender = () => {
      if (turnstileContainerRef.current && window.turnstile && !turnstileWidgetId.current) {
        try {
          const id = window.turnstile.render(turnstileContainerRef.current, {
            sitekey: sitekey,
            ...options,
          });
          turnstileWidgetId.current = id;
          console.warn('Turnstile widget rendered:', id);
        } catch (e) {
          console.error('Error rendering turnstile widget:', e);
        }
      }
    };

    if (checkTurnstileScript()) {
      setIsTurnstileScriptReady(true);
      attemptRender();
    } else {
      pollingInterval = window.setInterval(() => {
        if (checkTurnstileScript()) {
          clearInterval(pollingInterval);
          setIsTurnstileScriptReady(true);
          attemptRender();
        }
      }, 50);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (window.turnstile && turnstileWidgetId.current) {
        try {
          console.warn('Removing turnstile widget:', turnstileWidgetId.current);
          window.turnstile.remove(turnstileWidgetId.current);
        } catch (e) {
          console.error('Error removing turnstile widget:', e);
        }
        turnstileWidgetId.current = null;
      }
    };
  }, [sitekey, options, checkTurnstileScript]);

  useEffect(() => {
    if (isTurnstileScriptReady && turnstileContainerRef.current && !turnstileWidgetId.current) {
      try {
        const id = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: sitekey,
          ...options,
        });
        turnstileWidgetId.current = id;
        console.warn('Turnstile widget rendered after ref available:', id);
      } catch (e) {
        console.error('Error rendering turnstile widget after ref available:', e);
      }
    }
  }, [isTurnstileScriptReady, options, sitekey]);

  return turnstileContainerRef;
};

export default useTurnstile;
