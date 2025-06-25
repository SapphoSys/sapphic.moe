import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ redirect }) => {
  return redirect('https://auth.sappho.systems/.well-known/webfinger', 302);
};
