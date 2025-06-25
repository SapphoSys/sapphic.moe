import { db, Guestbook } from 'astro:db';
import { TURNSTILE_SECRET_TOKEN } from 'astro:env/server';

import {
  CLOUDFLARE_TURNSTILE_URL,
  GUESTBOOK_MESSAGE_CHARACTER_LIMIT,
  GUESTBOOK_NAME_CHARACTER_LIMIT,
  GUESTBOOK_URL_CHARACTER_LIMIT,
  GUESTBOOK_VALID_COLORS,
} from '$utils/constants';
import { containsSuspiciousContent, isValidUrl } from '$utils/helpers/form';

interface SubmissionResult {
  success: boolean;
  error?: string;
}

export const handleSubmission = async (request: Request): Promise<SubmissionResult> => {
  const formData = await request.formData();

  const turnstile_token = formData.get('cf-turnstile-response');

  if (!turnstile_token) {
    return {
      success: false,
      error: 'Please complete the Turnstile verification.',
    };
  }

  const verifyFormData = new FormData();
  verifyFormData.append('secret', TURNSTILE_SECRET_TOKEN);
  verifyFormData.append('response', turnstile_token);

  const result = await fetch(CLOUDFLARE_TURNSTILE_URL, {
    body: verifyFormData,
    method: 'POST',
  });

  const outcome = await result.json();

  if (!outcome.success) {
    return {
      success: false,
      error: 'Turnstile verification failed. Please try again.',
    };
  }

  const name = formData.get('name');
  const message = formData.get('message');
  const url = formData.get('url');
  const color = formData.get('color')?.toString() ?? 'pink';
  const special = formData.get('special');

  if (special) {
    return { success: false, error: 'Suspicious activity detected.' };
  }

  if (!GUESTBOOK_VALID_COLORS.includes(color)) {
    return { success: false, error: 'Invalid color selected.' };
  }

  if (typeof name === 'string' && containsSuspiciousContent(name)) {
    return {
      success: false,
      error: 'Your submission contains invalid characters.',
    };
  }

  if (typeof message === 'string' && containsSuspiciousContent(message)) {
    return {
      success: false,
      error: 'Your submission contains invalid characters.',
    };
  }

  if (url && typeof url === 'string' && url.trim().length > 0) {
    if (!isValidUrl(url) || containsSuspiciousContent(url)) {
      return {
        success: false,
        error: 'Invalid URL format. Please provide a valid http:// or https:// URL.',
      };
    }
  }

  if (
    typeof name === 'string' &&
    name.trim().length > 0 &&
    typeof message === 'string' &&
    message.trim().length > 0 &&
    (typeof url === 'string' || url === null)
  ) {
    if (message.length > GUESTBOOK_MESSAGE_CHARACTER_LIMIT) {
      return {
        success: false,
        error: `Message cannot be longer than ${GUESTBOOK_MESSAGE_CHARACTER_LIMIT} characters.`,
      };
    }

    if (name.length > GUESTBOOK_NAME_CHARACTER_LIMIT) {
      return {
        success: false,
        error: `Name cannot be longer than ${GUESTBOOK_NAME_CHARACTER_LIMIT} characters.`,
      };
    }

    if (url && url.length > GUESTBOOK_URL_CHARACTER_LIMIT) {
      return {
        success: false,
        error: `URL cannot be longer than ${GUESTBOOK_URL_CHARACTER_LIMIT} characters.`,
      };
    }

    const values = {
      name: name.trim(),
      message: message.trim(),
      url: url?.trim() || null,
      color,
    };

    try {
      await db.insert(Guestbook).values(values);
      return { success: true };
    } catch (e) {
      console.error('Database insertion error:', e);
      return {
        success: false,
        error: 'Error saving message. Please try again.',
      };
    }
  } else {
    return { success: false, error: 'Name and message fields are required.' };
  }
};
