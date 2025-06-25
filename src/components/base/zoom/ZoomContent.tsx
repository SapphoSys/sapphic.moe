import { Icon } from '@iconify/react';
import type { ImgHTMLAttributes } from 'react';
import { useId, useState } from 'react';

import type { ZoomContentProps } from '$types/zoom';

const CustomZoomContent = ({ img, onUnzoom, disableTooltip = false }: ZoomContentProps) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipId = useId();

  const handleUnzoom = () => {
    setIsTooltipVisible(false);
    onUnzoom();
  };

  const altText = (img?.props as ImgHTMLAttributes<HTMLImageElement> | undefined)?.alt;

  return (
    <figure
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
      onClick={handleUnzoom}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {img}
        {altText !== undefined && !disableTooltip && (
          <div className="tooltip-container">
            <button
              type="button"
              className="info-button"
              aria-expanded={isTooltipVisible}
              aria-label={isTooltipVisible ? 'Hide image information' : 'Show image information'}
              aria-describedby={tooltipId}
              onClick={(e) => {
                e.stopPropagation();
                setIsTooltipVisible(!isTooltipVisible);
              }}
            >
              <Icon
                icon={isTooltipVisible ? 'mdi:information-outline' : 'mdi:information'}
                aria-hidden={true}
                fontSize={32}
              />
            </button>
            <div
              id={tooltipId}
              role="tooltip"
              className={`tooltip ${isTooltipVisible ? 'visible' : ''}`}
            >
              <div>
                <h4 className="text-2xl font-bold">Image Information</h4>
                <p>{altText}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </figure>
  );
};

export default CustomZoomContent;
