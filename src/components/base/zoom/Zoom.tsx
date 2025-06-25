import { type FC, useCallback, useState } from 'react';
import { Controlled as ControlledZoom } from 'react-medium-image-zoom';

import OriginalZoomContent from '$components/base/zoom/ZoomContent.tsx';
import { IconUnzoom, IconZoom } from '$components/base/zoom/ZoomIcons.tsx';
import type { ZoomContentProps, ZoomProps } from '$types/zoom';

const ZoomComponent: FC<ZoomProps> = ({ children, disableTooltip = false }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleZoomChange = useCallback((shouldZoom: boolean) => {
    setIsZoomed(shouldZoom);
  }, []);

  const CustomZoomContentWithProp = useCallback(
    (props: ZoomContentProps) => {
      return <OriginalZoomContent {...props} disableTooltip={disableTooltip} />;
    },
    [disableTooltip]
  );

  return (
    <ControlledZoom
      isZoomed={isZoomed}
      onZoomChange={handleZoomChange}
      ZoomContent={CustomZoomContentWithProp}
      IconZoom={IconZoom}
      IconUnzoom={IconUnzoom}
    >
      {children}
    </ControlledZoom>
  );
};

export default ZoomComponent;
