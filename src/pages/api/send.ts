export const prerender = false;

import type { APIRoute } from 'astro';

import { analytics } from '$utils/config';

export const POST: APIRoute = async (ctx) => {
  const umamiApiUrl = `${analytics.url}/api/send`;

  try {
    const requestBody = await ctx.request.json();

    const headersToSend = new Headers();
    headersToSend.set('Content-Type', 'application/json');

    const referer = ctx.request.headers.get('referer');
    if (referer) headersToSend.set('Referer', referer);

    const userAgent = ctx.request.headers.get('user-agent');
    if (userAgent) headersToSend.set('User-Agent', userAgent);

    const origin = ctx.request.headers.get('origin');
    if (origin) headersToSend.set('Origin', origin);

    const xForwardedFor = ctx.request.headers.get('x-forwarded-for');
    if (xForwardedFor) headersToSend.set('X-Forwarded-For', xForwardedFor);

    const xRealIp = ctx.request.headers.get('x-real-ip');
    if (xRealIp) headersToSend.set('X-Real-IP', xRealIp);

    const response = await fetch(umamiApiUrl, {
      method: ctx.request.method,
      headers: headersToSend,
      body: JSON.stringify(requestBody),
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Error proxying Umami data:', error);
    return new Response('Internal Server Error sending analytics data.', {
      status: 500,
    });
  }
};
