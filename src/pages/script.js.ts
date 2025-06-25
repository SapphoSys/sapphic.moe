import type { APIRoute } from 'astro';

import { analytics } from '$utils/config';


export const GET: APIRoute = async () => {
  const umamiScriptUrl = `${analytics.url}${analytics.script}`;

  try {
    const response = await fetch(umamiScriptUrl);

    if (!response.ok) {
      console.error(`Failed to fetch Umami script: ${response.status} ${response.statusText}`);
      return new Response('Analytics script not found.', { status: 404 });
    }

    const scriptContent = await response.text();

    return new Response(scriptContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error proxying Umami script:', error);
    return new Response('Internal Server Error fetching analytics script.', {
      status: 500,
    });
  }
};
