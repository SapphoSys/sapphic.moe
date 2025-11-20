import { envField } from 'astro/config';

export const schema = {
  // Turnstile
  PUBLIC_TURNSTILE_SITE_KEY: envField.string({
    context: 'client',
    access: 'public',
    default: '',
  }),
  TURNSTILE_SECRET_TOKEN: envField.string({
    context: 'server',
    access: 'secret',
    default: '',
  }),

  // API Keys
  OWM_API_KEY: envField.string({
    context: 'server',
    access: 'secret',
    default: '',
  }),
  LASTFM_API_KEY: envField.string({
    context: 'server',
    access: 'secret',
    default: '',
  }),

  // Database
  ASTRO_DB_REMOTE_URL: envField.string({
    context: 'server',
    access: 'secret',
    default: '',
  }),
  ASTRO_DB_APP_TOKEN: envField.string({
    context: 'server',
    access: 'secret',
    default: '',
  }),
  ASTRO_DB_GUESTBOOK_DASHBOARD_URL: envField.string({
    context: 'server',
    access: 'secret',
    default: '',
  }),

  // Discord
  DISCORD_CONTACT_WEBHOOK_URL: envField.string({
    context: 'server',
    access: 'secret',
    default: '',
  }),
  DISCORD_GUESTBOOK_WEBHOOK_URL: envField.string({
    context: 'server',
    access: 'secret',
    default: '',
  }),
  DISCORD_USER_ID: envField.string({
    context: 'server',
    access: 'secret',
    default: '',
  }),
  LANYARD_API_URL: envField.string({
    context: 'server',
    access: 'secret',
    default: '',
  }),

  // Git commit info
  COMMIT_HASH: envField.string({
    context: 'server',
    access: 'secret',
    default: 'unknown',
  }),
  COMMIT_DATE: envField.string({
    context: 'server',
    access: 'secret',
    default: 'unknown',
  }),
};
