import type { APIRoute } from 'astro';

import { formatDate } from '$utils/helpers/date';

export const prerender = false;

export const GET: APIRoute = async ({ request, redirect }) => {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email') || '';
    const name = url.searchParams.get('name') || '';
    const message = url.searchParams.get('message') || '';

    if (!email) {
      return new Response('Missing email', { status: 400 });
    }

    // Compose subject and body using the date helper for ISO
    const subject = `Re: Message from ${name}`;
    const isoDate = formatDate(new Date(), 'iso');
    const body = `\n\nOn ${isoDate}, ${name} wrote:\n\n${message
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n')}`;

    // Properly encode subject and body for mailto
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    return redirect(mailtoUrl);
  } catch (error) {
    console.error('Error processing mailto URL:', error);
    return new Response('Error processing mailto URL', { status: 500 });
  }
};
