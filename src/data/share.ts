import type { SharePlatform } from '$types/share';
import { platforms } from '$utils/config';

export const sharePlatforms = [
  {
    name: 'Bluesky',
    icon: 'simple-icons:bluesky',
    color: 'ctp-blue',
    url: ({ title, url }) => {
      const encodedTitle = encodeURIComponent(title);
      const encodedUrl = encodeURIComponent(url);
      const shareText = `${encodedTitle} by ${platforms.bluesky}%0A${encodedUrl}`;
      return `https://bsky.app/intent/compose?text=${shareText}`;
    },
  },
  {
    name: 'Hacker News',
    icon: 'simple-icons:ycombinator',
    color: 'ctp-peach',
    url: ({ title, url }) => {
      const encodedTitle = encodeURIComponent(title);
      const encodedUrl = encodeURIComponent(url);
      return `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedTitle}`;
    },
  },
  {
    name: 'Lobste.rs',
    icon: 'simple-icons:lobsters',
    color: 'ctp-red',
    url: ({ title, url }) => {
      const encodedTitle = encodeURIComponent(title);
      const encodedUrl = encodeURIComponent(url);
      return `https://lobste.rs/stories/new?url=${encodedUrl}&title=${encodedTitle}`;
    },
  },
] satisfies SharePlatform[];
