import { Icon } from '@iconify/react';
import { type FC, useEffect, useState } from 'react';

import useLanyard from '$hooks/useLanyard';
import {
  DISCORD_STATUS_COLOR_MAP,
  DISCORD_STATUS_ICON_MAP,
  DISCORD_STATUS_MAP,
} from '$utils/constants';

export interface LanyardStatusProps {
  userId: string;
  refreshInterval?: number;
}

const LanyardStatus: FC<LanyardStatusProps> = ({ userId, refreshInterval = 30000 }) => {
  const { data, loading, error } = useLanyard(userId, refreshInterval);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);

  const status = data?.discord_status ?? 'offline';
  const statusIcon = DISCORD_STATUS_ICON_MAP[status] || DISCORD_STATUS_ICON_MAP.offline;
  const statusColorClass = DISCORD_STATUS_COLOR_MAP[status] || 'text-ctp-subtext0';

  if (loading && !initialLoadComplete) {
    return (
      <div className="flex items-center gap-1 rounded-md" role="status" aria-live="polite">
        <Icon
          icon="line-md:loading-loop"
          fontSize={16}
          aria-hidden={true}
          className="text-ctp-pink"
        />
      </div>
    );
  }

  if (error || !data) return null;

  const statusText = DISCORD_STATUS_MAP[status] || 'Unknown';

  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-label={`Discord status: ${statusText}`}
    >
      <Icon icon={statusIcon} fontSize={20} className={statusColorClass} aria-hidden={true} />
      <span className="text-base">{statusText}</span>
    </div>
  );
};

export default LanyardStatus;
