import catppuccin from '@catppuccin/tailwindcss';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import type { PluginAPI } from 'tailwindcss/types/config';

import { GUESTBOOK_VALID_COLORS } from './src/utils/constants';
import typographyConfig from './src/utils/typography';

const unsafeBorderContent = GUESTBOOK_VALID_COLORS.map((color) => `border-ctp-${color}`);
const unsafeTextContent = GUESTBOOK_VALID_COLORS.map((color) => `text-ctp-${color}`);

export default {
  safelist: [...unsafeBorderContent, ...unsafeTextContent],
  content: ['./src/**/*.{astro,html,js,md,mdx,ts,tsx}'],
  theme: {
    fontFamily: {
      body: ['Atkinson Hyperlegible', 'Inter', 'sans-serif'],
      mono: ['Iosevka', 'monospace'],
    },
    colors: {
      current: 'currentColor',
      transparent: 'transparent',
    },
    extend: {
      typography: typographyConfig,
    },
  },
  plugins: [
    catppuccin({ prefix: 'ctp' }),
    typography,

    ({ addComponents }: PluginAPI) => {
      addComponents({
        '.title': {
          '@apply text-3xl font-bold': {},
        },
        '.pixelated': {
          imageRendering: 'pixelated',
        },
      });
    },
  ],
} satisfies Config;
