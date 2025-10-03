import { type ChangeEvent, useCallback, useEffect, useState } from 'react';

import { FaChevronDown } from 'react-icons/fa';
import { RiPencilFill } from 'react-icons/ri';
import GuestbookPreview from '$components/guestbook/GuestbookPreview';
import useTurnstileState from '$hooks/useTurnstileState';
import {
  GUESTBOOK_MESSAGE_CHARACTER_LIMIT,
  GUESTBOOK_NAME_CHARACTER_LIMIT,
  GUESTBOOK_URL_CHARACTER_LIMIT,
  GUESTBOOK_VALID_COLORS,
} from '$utils/constants';
import { cn } from '$utils/helpers/misc';

import '$styles/form.css';

const GuestbookForm = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [color, setColor] = useState('mauve');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [previewDate] = useState(() => new Date());
  const { isTurnstileCompleted, turnstileToken, turnstileContainerRef } = useTurnstileState();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    setColor(mediaQuery.matches ? 'pink' : 'mauve');

    const onChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      setColor(e.matches ? 'pink' : 'mauve');
    };

    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value);
  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setMessage(event.target.value);
  const handleColorChange = (event: ChangeEvent<HTMLSelectElement>) => setColor(event.target.value);

  const messageCharacterCount = message.length;
  const nameCharacterCount = name.length;
  const urlCharacterCount = url.length;

  const showNameWarning = nameCharacterCount >= GUESTBOOK_NAME_CHARACTER_LIMIT * 0.8;
  const isNameOverLimit = nameCharacterCount >= GUESTBOOK_NAME_CHARACTER_LIMIT;

  const showUrlWarning = urlCharacterCount >= GUESTBOOK_URL_CHARACTER_LIMIT * 0.8;
  const isUrlOverLimit = urlCharacterCount >= GUESTBOOK_URL_CHARACTER_LIMIT;

  const showMessageWarning = messageCharacterCount >= GUESTBOOK_MESSAGE_CHARACTER_LIMIT * 0.85;
  const isMessageOverLimit = messageCharacterCount >= GUESTBOOK_MESSAGE_CHARACTER_LIMIT;

  const isFormValid =
    !isMessageOverLimit &&
    !isNameOverLimit &&
    !isUrlOverLimit &&
    name.trim().length > 0 &&
    message.trim().length > 0 &&
    isTurnstileCompleted &&
    turnstileToken !== null;

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => setUrl(event.target.value);

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

  const colorOptions = GUESTBOOK_VALID_COLORS.map((colorOption) => {
    const isDefault =
      (colorOption === 'mauve' && !isDarkMode) || (colorOption === 'pink' && isDarkMode);
    return {
      value: colorOption,
      label: isDefault
        ? `${colorOption.charAt(0).toUpperCase() + colorOption.slice(1)} (Default)`
        : colorOption.charAt(0).toUpperCase() + colorOption.slice(1),
      className: cn(`text-ctp-${colorOption} hover:bg-ctp-${colorOption}/10`),
    };
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="col-span-1">
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
            maxLength={GUESTBOOK_NAME_CHARACTER_LIMIT}
            className="w-full rounded-md border-2 border-ctp-surface2/60 bg-ctp-base px-4 py-2 transition ease-out focus:border-ctp-mauve focus:outline-none focus:ring-0 dark:focus:border-ctp-pink"
          />
          <p className="pt-2 text-base opacity-80">This can be your preferred name.</p>
          {showNameWarning && (
            <p
              className={`pt-2 text-base opacity-80 ${
                isNameOverLimit ? 'text-ctp-red' : 'text-ctp-peach'
              }`}
            >
              {nameCharacterCount} / {GUESTBOOK_NAME_CHARACTER_LIMIT} characters
              {isNameOverLimit && ' - over limit!'}
            </p>
          )}
        </div>

        <div className="col-span-1">
          <label htmlFor="url" className="block pb-1 font-semibold">
            URL <span className="text-ctp-subtext0">(optional)</span>
          </label>
          <input
            id="url"
            name="url"
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="Your website"
            maxLength={GUESTBOOK_URL_CHARACTER_LIMIT}
            className="w-full rounded-md border-2 border-ctp-surface2/60 bg-ctp-base px-4 py-2 transition ease-out focus:border-ctp-mauve focus:outline-none focus:ring-0 dark:focus:border-ctp-pink"
          />
          <p className="pt-2 text-base opacity-80">Link your site or profile.</p>
          {showUrlWarning && url.length > 0 && (
            <p
              className={`pt-2 text-base opacity-80 ${
                isUrlOverLimit ? 'text-ctp-red' : 'text-ctp-peach'
              }`}
            >
              {urlCharacterCount} / {GUESTBOOK_URL_CHARACTER_LIMIT} characters
              {isUrlOverLimit && ' - over limit!'}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block pb-1 font-semibold">
          Message <span className="text-ctp-red">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={message}
          placeholder="Your message"
          onChange={handleMessageChange}
          required
          maxLength={GUESTBOOK_MESSAGE_CHARACTER_LIMIT}
          rows={4}
          className="w-full rounded-md border-2 border-ctp-surface2/60 bg-ctp-base px-4 py-2 transition ease-out focus:border-ctp-mauve focus:outline-none focus:ring-0 dark:focus:border-ctp-pink"
        />
        <p className="text-base opacity-80">Say hi! Keep it kind and fun.</p>

        {showMessageWarning && (
          <p
            className={`pt-2 text-base opacity-80 ${
              messageCharacterCount >= GUESTBOOK_MESSAGE_CHARACTER_LIMIT
                ? 'text-ctp-red'
                : 'text-ctp-peach'
            }`}
          >
            {messageCharacterCount} / {GUESTBOOK_MESSAGE_CHARACTER_LIMIT} characters
            {messageCharacterCount >= GUESTBOOK_MESSAGE_CHARACTER_LIMIT && ' - over limit!'}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="color" className="block pb-1 font-semibold">
          Color <span className="text-ctp-subtext0">(optional)</span>
        </label>
        <div className="relative">
          <select
            id="color"
            name="color"
            value={color}
            onChange={handleColorChange}
            className="w-full appearance-none rounded-md border-2 border-ctp-surface2/60 bg-ctp-base px-4 py-2 transition ease-out focus:border-ctp-mauve focus:outline-none focus:ring-0 dark:focus:border-ctp-pink"
          >
            {colorOptions.map(({ value, label, className }) => (
              <option key={value} value={value} className={className}>
                {label}
              </option>
            ))}
          </select>
          <FaChevronDown
            size={20}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ctp-subtext0"
            aria-hidden={true}
          />
        </div>
        <p className="pt-2 text-base opacity-80">
          Choose your message's color. You chose{' '}
          <span className={cn(`text-ctp-${color}`)}>
            {color}
            {(color === 'mauve' && !isDarkMode) || (color === 'pink' && isDarkMode)
              ? ' (default)'
              : ''}
          </span>
          .
        </p>
      </div>

      <div className="pt-2" id="cf-turnstile-widget" ref={turnstileContainerRef} />

      {turnstileToken && (
        <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />
      )}

      <div className="flex flex-row items-center justify-between">
        <button
          type="submit"
          disabled={!isFormValid}
          className="flex flex-row items-center gap-2 rounded-lg border-none bg-ctp-mauve px-2.5 py-1.5 text-center font-medium text-ctp-base disabled:cursor-not-allowed disabled:opacity-50 dark:bg-ctp-pink"
        >
          <RiPencilFill size={25} aria-hidden={true} />
          Sign
        </button>

        <span className="text-ctp-subtext1 max-sm:hidden">
          Or press{' '}
          <kbd className="rounded-md bg-ctp-mantle px-2 py-0.5 text-ctp-mauve dark:text-ctp-pink">
            Ctrl
          </kbd>{' '}
          +{' '}
          <kbd className="rounded-md bg-ctp-mantle px-2 py-0.5 text-ctp-mauve dark:text-ctp-pink">
            Enter
          </kbd>
        </span>
      </div>

      <GuestbookPreview
        name={name}
        message={message}
        url={url || undefined}
        color={color}
        previewDate={previewDate}
      />
    </>
  );
};

export default GuestbookForm;
