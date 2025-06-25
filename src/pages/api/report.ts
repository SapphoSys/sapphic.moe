export const prerender = false;

import type { APIRoute } from 'astro';

import { handleSubmission } from '$utils/forms/report';

export const POST: APIRoute = async ({ request }) => {
  const result = await handleSubmission(request);

  return new Response(
    JSON.stringify({
      message: result.message,
    }),
    { status: result.status }
  );
};
