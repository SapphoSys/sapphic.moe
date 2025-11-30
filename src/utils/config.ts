import type { Link } from '$types/config';

export const site = {
  name: 'Sapphic Angels',
  description: 'Software engineers with a knack for system administration.',
  url: 'https://sapphic.moe',
};

export const preferences = {
  dateFormat: 'MMMM d, yyyy',
  location: 'Almaty',
  timeFormat: 'HH:mm:ss',
  timeZone: 'Asia/Almaty',
};

export const analytics = {
  url: 'https://umami.sappho.systems',
  script: '/script.js',
  websiteId: '1279cae7-78b6-4bfd-b13c-10d4dd9893ee',
};

export const blog = {
  autoImportComponents: ['$components/base/Accordion.astro'],
  giscus: {
    'data-repo': 'SapphoSys/sapphic.moe',
    'data-repo-id': 'MDEwOlJlcG9zaXRvcnkzODQ2OTI0OTY=',
    'data-category': 'Comments',
    'data-category-id': 'DIC_kwDOFu3xEM4CTiMS',
    'data-mapping': 'og:title',
    'data-strict': '1',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'top',
    'data-loading': 'lazy',
    'data-theme': 'https://giscus.catppuccin.com/themes/mocha-pink.css',
    'data-lang': 'en',
    crossorigin: 'anonymous',
  },
};

export const rss = {
  title: 'Sapphic Angels',
  description: 'A personal blog, comprising of whatever stuff we feel like rambling about.',
  email: 'contact@sapphic.moe',
  feed: '/rss.xml',
  stylesheet: '/rss/feed.xsl',
};

export const images = {
  alt: 'The pink flower of a cherry blossom tree.',
  path: '/favicon.png',

  openGraph: {
    dimensions: {
      width: 1200,
      height: 630,
    },
  },
};

export const footerLinks: Link[][] = [
  [
    { link: '/webrings', icon: 'mdi:account-plus', text: 'Webrings' },
    { link: '/guestbook', icon: 'mdi:pencil-box-multiple', text: 'Guestbook' },
    { link: '/misc', icon: 'mdi:multiplication', text: 'Misc' },
    { link: '/rss.xml', icon: 'mdi:rss', text: 'RSS', new: true },
  ],

  [
    { link: '/contact', icon: 'mdi:at', text: 'Contact' },
    { link: '/message', icon: 'mdi:message', text: 'Message' },
    {
      link: 'https://ko-fi.com/solelychloe',
      icon: 'mdi:heart',
      text: 'Support us',
      new: true,
    },
    {
      link: 'https://github.com/SapphoSys/sapphic.moe',
      icon: 'mdi:source-fork',
      text: 'Source code',
      new: true,
    },
  ],
];

export const navLinks: Link[] = [
  { link: '/about', icon: 'mdi:information', text: 'About' },
  { link: '/articles', icon: 'mdi:pencil', text: 'Articles' },
  // { link: '/feeds', icon: 'mdi:feed', text: '/feeds' },
  { link: '/uses', icon: 'mdi:tools', text: '/uses' },
];

export const platforms = {
  aniList: 'SapphoSys',
  bluesky: '@sapphic.moe',
  discordID: '312145496179474434',
  github: 'SapphoSys',
  lastFM: 'solelychloe',
  listenBrainz: 'SapphoSys',
  mastodon: 'https://wetdry.world/@chloe',
  twitter: 'SapphoSys',
};

export const colors = {
  dark: {
    bulletPoints: '#f5c2e7',
    lineBreak: '#f5c2e7',
    link: '#f5c2e7',
    linkHover: '#c99fbe',
  },
  light: {
    bulletPoints: '#8839ef',
    lineBreak: '#8839ef',
    link: '#8839ef',
    linkHover: '#6027ab',
  },
};
