import { type AstroExpressiveCodeOptions } from 'astro-expressive-code';

export const expressiveCodeOptions = {
  themes: ['catppuccin-latte', 'catppuccin-mocha'],

  styleOverrides: {
    frames: {
      editorActiveTabIndicatorTopColor: ({ theme }) =>
        theme.type === 'light' ? theme.colors['focusBorder'] : theme.colors['terminal.ansiMagenta'],
      editorActiveTabForeground: ({ theme }) =>
        theme.type === 'light' ? theme.colors['focusBorder'] : theme.colors['terminal.ansiMagenta'],
      tooltipSuccessBackground: ({ theme }) => theme.colors['terminal.ansiGreen'],
      tooltipSuccessForeground: ({ theme }) => theme.colors['textBlockQuote.background'],
      shadowColor: '#000000',
    },
  },
} satisfies AstroExpressiveCodeOptions;
