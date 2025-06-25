import { db, Guestbook, sql } from 'astro:db';
import {
  ASTRO_DB_GUESTBOOK_DASHBOARD_URL,
  DISCORD_GUESTBOOK_WEBHOOK_URL,
  TURNSTILE_SECRET_TOKEN,
} from 'astro:env/server';

import { CLOUDFLARE_TURNSTILE_URL } from '$utils/constants';

interface ReportProps {
  entryId: number;
  reason: string;
}

interface SubmissionResult {
  success: boolean;
  message: string;
  status: number;
}

const sendDiscordMessage = async (details: ReportProps, url: string) => {
  const entry = await db
    .select()
    .from(Guestbook)
    .where(sql`id = ${details.entryId}`)
    .get();

  if (!entry) {
    throw new Error('Guestbook entry not found');
  }

  const messagePayload = {
    flags: 1 << 15,
    components: [
      {
        type: 17,
        accent_color: 0xff0000,
        components: [
          {
            type: 10,
            content: `<@312145496179474434> New report! 🚩`,
          },
          {
            type: 10,
            content: `## Author\n${entry.name}${entry.url ? ` (${entry.url})` : ''}\n## Message\n${entry.message}\n## Reason\n${details.reason}`,
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
        accent_color: 0xff0000,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: 'View dashboard',
                style: 5,
                url: ASTRO_DB_GUESTBOOK_DASHBOARD_URL,
              },
            ],
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
      message: 'Please complete the Turnstile verification.',
      status: 400,
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
      message: 'Turnstile verification failed. Please try again.',
      status: 500,
    };
  }

  const entryId = Number.parseInt(data.get('entryId')?.toString() || '', 10);
  const reason = data.get('reason')?.toString();

  if (!entryId || !reason) {
    return {
      success: false,
      message: 'Missing required fields',
      status: 400,
    };
  }

  try {
    await sendDiscordMessage(
      { entryId, reason },
      `${DISCORD_GUESTBOOK_WEBHOOK_URL}?with_components=true`
    );

    return {
      success: true,
      message: 'Report sent successfully',
      status: 200,
    };
  } catch (error) {
    console.error('Error sending report:', error);
    return {
      success: false,
      message: 'Error sending report',
      status: 500,
    };
  }
};
