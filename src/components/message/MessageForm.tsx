import { MdEmail } from 'react-icons/md';
import { type ChangeEvent, useCallback, useEffect, useState } from 'react';

import useTurnstileState from '$hooks/useTurnstileState';
import { MESSAGE_CHARACTER_LIMIT } from '$utils/constants';

import '$styles/form.css';

const MessageForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { isTurnstileCompleted, turnstileToken, turnstileContainerRef } = useTurnstileState();

  const warningThreshold = Math.floor(MESSAGE_CHARACTER_LIMIT * 0.8);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value);
  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value);
  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setMessage(event.target.value);

  const messageCharacterCount = message.length;
  const showWarning = messageCharacterCount >= warningThreshold;
  const isOverLimit = messageCharacterCount > MESSAGE_CHARACTER_LIMIT;

  const isFormValid =
    !isOverLimit &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    message.trim().length > 0 &&
    isTurnstileCompleted &&
    turnstileToken !== null;

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
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block pb-1 font-semibold">
            Name <span className="text-ctp-red">*</span>
          </label>
          <input
            id="name"
            name="name"
            value={name}
            placeholder="Your name"
            onChange={handleNameChange}
            required
            className="w-full rounded-md border-2 border-ctp-surface2/60 bg-ctp-base px-4 py-2 transition ease-out focus:border-ctp-mauve focus:outline-none focus:ring-0 dark:focus:border-ctp-pink"
          />
          <p className="pt-2 text-base opacity-80">This can be your preferred name.</p>
        </div>

        <div>
          <label htmlFor="email" className="block pb-1 font-semibold">
            Email <span className="text-ctp-red">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            placeholder="hello@example.com"
            onChange={handleEmailChange}
            required
            className="w-full rounded-md border-2 border-ctp-surface2/60 bg-ctp-base px-4 py-2 transition ease-out focus:border-ctp-mauve focus:outline-none focus:ring-0 dark:focus:border-ctp-pink"
          />
          <p className="pt-2 text-base opacity-80">We cannot contact you without this.</p>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block pb-1 font-semibold">
          Message <span className="text-ctp-red">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          placeholder="Hello, world!"
          rows={4}
          value={message}
          onChange={handleMessageChange}
          maxLength={MESSAGE_CHARACTER_LIMIT}
          className="w-full rounded-md border-2 border-ctp-surface2/60 bg-ctp-base px-4 py-2 transition ease-out focus:border-ctp-mauve focus:outline-none focus:ring-0 dark:focus:border-ctp-pink"
        />
        <p className="text-base opacity-80">Your message goes here!</p>
        {showWarning && (
          <p
            className={`pt-2 text-base opacity-80 ${
              messageCharacterCount >= MESSAGE_CHARACTER_LIMIT ? 'text-ctp-red' : 'text-ctp-peach'
            }`}
          >
            {messageCharacterCount} / {MESSAGE_CHARACTER_LIMIT} characters
            {messageCharacterCount >= MESSAGE_CHARACTER_LIMIT && ' - over limit!'}
          </p>
        )}
      </div>

      <div className="pt-2" ref={turnstileContainerRef} />

      {turnstileToken && (
        <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />
      )}

      <div className="flex flex-row items-center justify-between">
        <button
          type="submit"
          disabled={!isFormValid}
          className="flex flex-row items-center gap-2 rounded-lg border-none bg-ctp-mauve px-2.5 py-1.5 text-center font-medium text-ctp-base transition ease-out hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-ctp-pink"
        >
          <MdEmail size={20} aria-hidden={true} className="text-ctp-base" />
          Send
        </button>

        <div className="text-ctp-subtext1 max-sm:hidden">
          Or press{' '}
          <kbd className="rounded-md bg-ctp-mantle px-2 py-0.5 text-ctp-mauve dark:text-ctp-pink">
            Ctrl
          </kbd>{' '}
          +{' '}
          <kbd className="rounded-md bg-ctp-mantle px-2 py-0.5 text-ctp-mauve dark:text-ctp-pink">
            Enter
          </kbd>
        </div>
      </div>
    </>
  );
};

export default MessageForm;
