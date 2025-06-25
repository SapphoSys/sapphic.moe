export interface TurnstileWidgetOptions {
  theme?: 'auto' | 'light' | 'dark';
  size?: 'normal' | 'compact' | 'flexible';
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'timeout-callback'?: () => void;
  tabindex?: number;
  retry?: 'auto' | 'never';
  'retry-interval'?: number;
  language?: string;
  chlPageData?: string;
  autoRefreshRate?: 'auto' | 'never';
  execution?: 'render' | 'auto' | 'execute';
  appearance?: 'always' | 'interaction-only';
}
