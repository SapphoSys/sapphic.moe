export const CLOUDFLARE_TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const FEEDS_MAX_ITEMS = 150;

export const GUESTBOOK_MESSAGE_CHARACTER_LIMIT = 140;
export const GUESTBOOK_NAME_CHARACTER_LIMIT = 50;
export const GUESTBOOK_URL_CHARACTER_LIMIT = 50;
export const GUESTBOOK_VALID_COLORS = [
  'pink',
  'mauve',
  'red',
  'maroon',
  'peach',
  'yellow',
  'green',
  'teal',
  'sky',
  'sapphire',
  'blue',
  'lavender',
];

export const LASTFM_PLACEHOLDER_IMAGE =
  'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';

export const MESSAGE_CHARACTER_LIMIT = 1000;

export const DISCORD_STATUS_COLOR_MAP: Record<string, string> = {
  online: 'text-ctp-green',
  idle: 'text-ctp-yellow',
  dnd: 'text-ctp-red',
  offline: 'text-ctp-lavender',
};

export const DISCORD_STATUS_ICON_MAP: Record<string, string> = {
  online: 'mdi:circle',
  idle: 'mdi:moon-and-stars',
  dnd: 'mdi:minus-circle',
  offline: 'mdi:power-sleep',
};

export const DISCORD_STATUS_MAP: Record<string, string> = {
  online: 'Online',
  idle: 'Away',
  dnd: 'Busy',
  offline: 'Offline',
};

export const WEATHER_ICON_MAP: Record<string, string> = {
  '01d': 'mdi:weather-sunny',
  '01n': 'mdi:weather-night',
  '02d': 'mdi:weather-partly-cloudy',
  '02n': 'mdi:weather-night-partly-cloudy',
  '03d': 'mdi:weather-cloudy',
  '03n': 'mdi:weather-cloudy',
  '09d': 'mdi:weather-pouring',
  '09n': 'mdi:weather-pouring',
  '10d': 'mdi:weather-rainy',
  '10n': 'mdi:weather-rainy',
  '11d': 'mdi:weather-lightning',
  '11n': 'mdi:weather-lightning',
  '13d': 'mdi:weather-snowy',
  '13n': 'mdi:weather-snowy',
  '50d': 'mdi:weather-fog',
  '50n': 'mdi:weather-fog',
};
