import { DISCORD_CONTACT_WEBHOOK_URL, TURNSTILE_SECRET_TOKEN } from 'astro:env/server';

import { site } from '$utils/config';
import { CLOUDFLARE_TURNSTILE_URL, MESSAGE_CHARACTER_LIMIT } from '$utils/constants';

export interface MessageDetails {
  name: string;
  email: string;
  message: string;
}

export interface SubmissionResult {
  success: boolean;
  error?: string;
}

const returnEncodedMailtoUrl = (email: string, name: string, message: string) => {
  const url = new URL(`${site.url}/api/mailto`);
  url.searchParams.set('email', email);
  url.searchParams.set('name', name);
  url.searchParams.set('message', message);

  return `<${url.href}>`;
};

const sendDiscordMessage = async (details: MessageDetails, url: string) => {
  const messagePayload = {
    flags: 1 << 15,
    components: [
      {
        type: 17,
        accent_color: 0xf38ba8,
        components: [
          {
            type: 10,
            content: `<@312145496179474434> New message! 📧`,
          },
          {
            type: 10,
            content: `## Name\n${details.name}\n## Email\n${details.email}\n## Message\n${details.message}`,
          },
        ],
      },
    ],
  };

  const linkPayload = {
    flags: 1 << 15,
    components: [
      {
        type: 17,
        accent_color: 0xf38ba8,
        components: [
          {
            type: 10,
            content: `🔗 [Reply via email](${returnEncodedMailtoUrl(details.email, details.name, details.message)})`,
          },
        ],
      },
    ],
  };

  const messageResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messagePayload),
  });

  if (!messageResponse.ok) throw new Error('Failed to send message content');

  const linkResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(linkPayload),
  });

  if (!linkResponse.ok) throw new Error('Failed to send reply link');

  return messageResponse;
};

export const handleSubmission = async (request: Request): Promise<SubmissionResult> => {
  const data = await request.formData();

  const turnstile_token = data.get('cf-turnstile-response');

  if (!turnstile_token) {
    return {
      success: false,
      error: 'Please complete the Turnstile verification.',
    };
  }

  const verifyParams = new URLSearchParams();
  verifyParams.append('secret', TURNSTILE_SECRET_TOKEN);
  verifyParams.append('response', turnstile_token.toString());

  const result = await fetch(CLOUDFLARE_TURNSTILE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: verifyParams,
  });

  const outcome = await result.json();

  if (!outcome.success) {
    console.error('Turnstile verification failed:', outcome);
    return {
      success: false,
      error: 'Turnstile verification failed. Please try again.',
    };
  }

  const name = data.get('name')?.toString();
  const email = data.get('email')?.toString();
  const message = data.get('message')?.toString();
  const special = data.get('special');

  if (special) {
    return { success: false, error: 'Suspicious activity detected.' };
  }

  if (
    !name ||
    name.trim().length === 0 ||
    !email ||
    email.trim().length === 0 ||
    !message ||
    message.trim().length === 0
  ) {
    return {
      success: false,
      error: 'Name, email, and message fields are required.',
    };
  }

  if (message.length > MESSAGE_CHARACTER_LIMIT) {
    return {
      success: false,
      error: `Message cannot be longer than ${MESSAGE_CHARACTER_LIMIT} characters.`,
    };
  }

  try {
    const webhookUrl = new URL(DISCORD_CONTACT_WEBHOOK_URL);
    webhookUrl.searchParams.append('with_components', 'true');

    const discordResponse = await sendDiscordMessage(
      { name, email, message },
      webhookUrl.toString()
    );

    if (!discordResponse.ok) {
      console.error(
        'Failed to send message to Discord:',
        discordResponse.status,
        discordResponse.statusText,
        await discordResponse.text()
      );
      return {
        success: false,
        error: 'Error sending message. Please try again.',
      };
    }

    return { success: true };
  } catch (err) {
    console.error('Error during message sending process:', err);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
};
