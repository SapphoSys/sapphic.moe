import { colors } from './config';

const typography = () => ({
  DEFAULT: {
    css: {
      '--tw-prose-bullets': colors.light.bulletPoints,
      'code::before': {
        content: '""',
      },
      'code::after': {
        content: '""',
      },
      code: {
        backgroundColor: '#11111b',
        padding: '0.05rem 0.5rem',
        color: '#cdd6f4',
        borderRadius: '0.375rem',
      },

      hr: {
        background: colors.light.lineBreak,
        height: '1px',
        borderTopWidth: '0',
      },
      a: {
        color: colors.light.link,
        textDecorationLine: 'none',
        '@media (prefers-color-scheme: dark)': {
          color: colors.dark.link,
        },

        '&:hover': {
          color: colors.light.linkHover,
          textDecorationLine: 'underline',
          '@media (prefers-color-scheme: dark)': {
            color: colors.dark.linkHover,
          },
        },
      },
      figure: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',

        '& img': {
          width: '100%',
          height: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
        },
      },
      figcaption: {
        fontStyle: 'italic',
        color: 'white',
        opacity: '0.75',
      },
    },
  },
  invert: {
    css: {
      '--tw-prose-invert-bullets': colors.dark.bulletPoints,

      hr: {
        background: colors.dark.lineBreak,
      },
      a: {
        color: colors.dark.link,

        '&:hover': {
          color: colors.dark.linkHover,
        },
      },
    },
  },
});

export default typography;
