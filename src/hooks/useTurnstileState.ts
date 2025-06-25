import { PUBLIC_TURNSTILE_SITE_KEY } from 'astro:env/client';
import { type RefObject, useCallback, useMemo, useState } from 'react';

import useTurnstile from '$hooks/useTurnstile';
import type { TurnstileWidgetOptions } from '$types/turnstile';

export interface TurnstileState {
  isTurnstileCompleted: boolean;
  turnstileToken: string | null;
  turnstileContainerRef: RefObject<HTMLDivElement | null>;
}

const useTurnstileState = (): TurnstileState => {
  const [isTurnstileCompleted, setIsTurnstileCompleted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleTurnstileComplete = useCallback(
    (token: string) => {
      if (token) {
        setIsTurnstileCompleted(true);
        setTurnstileToken(token);
      } else {
        setIsTurnstileCompleted(false);
        setTurnstileToken(null);
      }
    },
    [setIsTurnstileCompleted, setTurnstileToken]
  );

  const handleTurnstileError = useCallback(() => {
    console.error('Turnstile encountered an error.');
    setIsTurnstileCompleted(false);
    setTurnstileToken(null);
  }, [setIsTurnstileCompleted, setTurnstileToken]);

  const handleTurnstileTimeout = useCallback(() => {
    console.warn('Turnstile timed out. Please re-verify.');
    setIsTurnstileCompleted(false);
    setTurnstileToken(null);
  }, [setIsTurnstileCompleted, setTurnstileToken]);

  const turnstileOptions = useMemo<TurnstileWidgetOptions>(
    () => ({
      callback: handleTurnstileComplete,
      'error-callback': handleTurnstileError,
      'timeout-callback': handleTurnstileTimeout,
      theme: 'auto',
      size: 'flexible',
    }),
    [handleTurnstileComplete, handleTurnstileError, handleTurnstileTimeout]
  );

  const turnstileContainerRef = useTurnstile({
    sitekey: PUBLIC_TURNSTILE_SITE_KEY,
    options: turnstileOptions,
  });

  return {
    isTurnstileCompleted,
    turnstileToken,
    turnstileContainerRef,
  };
};

export default useTurnstileState;
