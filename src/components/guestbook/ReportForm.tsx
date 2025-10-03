import { FaArrowLeft, FaFlag } from 'react-icons/fa';
import { type ChangeEvent, useCallback, useEffect, useState } from 'react';

import useTurnstileState from '$hooks/useTurnstileState';

interface ReportFormProps {
  entryId: number;
}

const ReportForm = ({ entryId }: ReportFormProps) => {
  const [reason, setReason] = useState('');
  const { isTurnstileCompleted, turnstileToken, turnstileContainerRef } = useTurnstileState();

  const reasonCharacterLimit = 1000;
  const warningThreshold = Math.floor(reasonCharacterLimit * 0.8);

  const handleReasonChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setReason(event.target.value);

  const reasonCharacterCount = reason.length;
  const showWarning = reasonCharacterCount >= warningThreshold;
  const isOverLimit = reasonCharacterCount > reasonCharacterLimit;
  const isFormValid = reason.trim() && isTurnstileCompleted && !isOverLimit;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Enter' && isFormValid) {
        const form = (event.target as HTMLElement).closest('form');
        if (form instanceof HTMLFormElement) {
          form.requestSubmit();
        }
      }
    },
    [isFormValid]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <form method="POST" className="flex flex-col gap-4">
      <div>
        <label htmlFor="reason" className="block pb-1 font-semibold">
          Reason for reporting
        </label>
        <textarea
          id="reason"
          name="reason"
          value={reason}
          onChange={handleReasonChange}
          required
          maxLength={reasonCharacterLimit}
          rows={4}
          placeholder="Please explain why you're reporting this message"
          className="w-full rounded-md border-2 border-ctp-surface2/60 bg-ctp-base px-4 py-2 transition ease-out focus:border-ctp-pink focus:outline-none focus:ring-0"
        />
        <p className="text-base opacity-80">
          Please provide a clear and specific reason for reporting this message. This helps us take
          appropriate action.
        </p>
        {showWarning && (
          <p
            className={`pt-2 text-base opacity-80 ${
              reasonCharacterCount >= reasonCharacterLimit ? 'text-ctp-red' : 'text-ctp-peach'
            }`}
          >
            {reasonCharacterCount} / {reasonCharacterLimit} characters
            {reasonCharacterCount >= reasonCharacterLimit && ' - over limit!'}
          </p>
        )}
      </div>

      <div className="py-2" ref={turnstileContainerRef} />

      <input type="hidden" name="entryId" value={entryId} />

      {turnstileToken && (
        <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />
      )}

      <div className="flex flex-row items-center justify-between">
        <a
          href="/guestbook"
          className="flex flex-row items-center gap-2 rounded-lg bg-ctp-mauve px-2.5 py-1.5 text-base text-ctp-base transition hover:opacity-80 dark:bg-ctp-pink"
        >
          <FaArrowLeft size={20} aria-hidden={true} />
          Back
        </a>
        <button
          type="submit"
          disabled={!isFormValid}
          className="flex flex-row items-center gap-2 rounded-lg bg-ctp-red px-2.5 py-1.5 text-center text-base font-medium text-ctp-base transition ease-out hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaFlag size={20} aria-hidden={true} />
          Report
        </button>
      </div>
      <p className="pt-3 text-ctp-subtext1">
        <span className="font-semibold">TIP:</span> You can also press{' '}
        <kbd className="rounded-md bg-ctp-mantle px-2 py-0.5 text-ctp-pink">Ctrl</kbd> +{' '}
        <kbd className="rounded-md bg-ctp-mantle px-2 py-0.5 text-ctp-pink">Enter</kbd> to submit
        your report.
      </p>
    </form>
  );
};

export default ReportForm;
