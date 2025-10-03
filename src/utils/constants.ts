import type { IconType } from 'react-icons/lib';
import { MdCircle, MdNightlightRound, MdPowerSettingsNew, MdRemoveCircle } from 'react-icons/md';
import {
  RiCloudLine,
  RiCloudy2Line,
  RiDrizzleLine,
  RiFoggyLine,
  RiMoonClearLine,
  RiRainyLine,
  RiSnowyLine,
  RiSunLine,
  RiThunderstormsLine,
} from 'react-icons/ri';

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

export const DISCORD_STATUS_ICON_MAP: Record<string, IconType> = {
  online: MdCircle,
  idle: MdNightlightRound,
  dnd: MdRemoveCircle,
  offline: MdPowerSettingsNew,
};

export const DISCORD_STATUS_MAP: Record<string, string> = {
  online: 'Online',
  idle: 'Away',
  dnd: 'Busy',
  offline: 'Offline',
};

export const WEATHER_ICON_MAP: Record<string, IconType> = {
  '01d': RiSunLine,
  '01n': RiMoonClearLine,
  '02d': RiCloudy2Line,
  '02n': RiCloudy2Line,
  '03d': RiCloudLine,
  '03n': RiCloudLine,
  '09d': RiDrizzleLine,
  '09n': RiDrizzleLine,
  '10d': RiRainyLine,
  '10n': RiRainyLine,
  '11d': RiThunderstormsLine,
  '11n': RiThunderstormsLine,
  '13d': RiSnowyLine,
  '13n': RiSnowyLine,
  '50d': RiFoggyLine,
  '50n': RiFoggyLine,
};
