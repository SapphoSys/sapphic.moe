import type { Webring } from '$types/webring';

export const webrings = [
  {
    name: 'Sapphic Webring',
    description: 'A webring, for those who make cool stuff on the wide web.',
    color: 'pink',
    links: {
      previous: 'https://ring.sapphic.moe/sapphic/previous',
      base: 'https://ring.sapphic.moe',
      next: 'https://ring.sapphic.moe/sapphic/next',
    },
  },
] satisfies Webring[];
