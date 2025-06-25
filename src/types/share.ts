export interface SharePlatform {
  name: string;
  icon: string;
  color: string;
  url: (params: ShareUrlParams) => string;
}

export interface ShareUrlParams {
  title: string;
  url: string;
  text?: string;
  via?: string;
}

export interface ShareButtonProps {
  platform: SharePlatform;
  params: ShareUrlParams;
  buttonClass?: string;
}

export interface NativeShareButtonProps extends ShareUrlParams {
  messageBoxClass?: string;
  buttonClass?: string;
}
