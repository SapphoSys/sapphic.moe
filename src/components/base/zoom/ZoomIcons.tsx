import { FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import type { FC } from 'react';

export const IconZoom: FC = () => (
  <FaSearchPlus size={32} aria-hidden={true} className="text-ctp-mauve dark:text-ctp-pink" />
);

export const IconUnzoom: FC = () => (
  <FaSearchMinus size={32} aria-hidden={true} className="text-ctp-mauve dark:text-ctp-pink" />
);
