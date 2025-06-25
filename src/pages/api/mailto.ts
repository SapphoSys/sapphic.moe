import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const mailtoUrl = decodeURIComponent(url.searchParams.get('url') || '');

    if (!mailtoUrl || !mailtoUrl.toLowerCase().startsWith('mailto:')) {
      return new Response('Invalid mailto URL', { status: 400 });
    }

    return Response.redirect(mailtoUrl, 302);
  } catch (error) {
    console.error('Error processing mailto URL:', error);
    return new Response('Error processing mailto URL', { status: 500 });
  }
};
