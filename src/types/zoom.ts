import type { ImgHTMLAttributes, JSXElementConstructor, ReactElement } from 'react';

export interface ZoomProps {
  children: ReactElement<
    ImgHTMLAttributes<HTMLImageElement>,
    string | JSXElementConstructor<unknown>
  > | null;
  disableTooltip?: boolean;
}

export interface ZoomContentProps {
  img: ReactElement<unknown, string | JSXElementConstructor<unknown>> | null;
  buttonUnzoom: ReactElement<HTMLButtonElement, string | JSXElementConstructor<unknown>>;
  modalState: unknown;
  onUnzoom: () => void;
  disableTooltip?: boolean;
}