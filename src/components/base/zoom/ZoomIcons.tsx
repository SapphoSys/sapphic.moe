import { Icon } from '@iconify/react';
import type { FC } from 'react';

export const IconZoom: FC = () => (
  <Icon
    icon="mdi:magnify-plus"
    fontSize={20}
    className="text-ctp-mauve dark:text-ctp-pink"
    aria-hidden={true}
  />
);

export const IconUnzoom: FC = () => (
  <Icon
    icon="mdi:magnify-minus"
    fontSize={20}
    className="text-ctp-mauve dark:text-ctp-pink"
    aria-hidden={true}
  />
);
