import { envField } from 'astro/config';

export const schema = {
  // Turnstile
  PUBLIC_TURNSTILE_SITE_KEY: envField.string({
    context: 'client',
    access: 'public',
  }),
  TURNSTILE_SECRET_TOKEN: envField.string({
    context: 'server',
    access: 'secret',
  }),

  // API Keys
  OWM_API_KEY: envField.string({
    context: 'server',
    access: 'secret',
  }),
  LASTFM_API_KEY: envField.string({
    context: 'server',
    access: 'secret',
  }),

  // Database
  ASTRO_DB_REMOTE_URL: envField.string({
    context: 'server',
    access: 'secret',
  }),
  ASTRO_DB_APP_TOKEN: envField.string({
    context: 'server',
    access: 'secret',
  }),
  ASTRO_DB_GUESTBOOK_DASHBOARD_URL: envField.string({
    context: 'server',
    access: 'secret',
  }),

  // Discord
  DISCORD_CONTACT_WEBHOOK_URL: envField.string({
    context: 'server',
    access: 'secret',
  }),
  DISCORD_GUESTBOOK_WEBHOOK_URL: envField.string({
    context: 'server',
    access: 'secret',
  }),
  DISCORD_USER_ID: envField.string({
    context: 'server',
    access: 'secret',
  }),
  LANYARD_API_URL: envField.string({
    context: 'server',
    access: 'secret',
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
