import { FaSpinner } from 'react-icons/fa';
import { FaExclamationTriangle } from 'react-icons/fa';
import { type FC, useEffect, useState } from 'react';

import useLanyard from '$hooks/useLanyard';
import {
  DISCORD_STATUS_COLOR_MAP,
  DISCORD_STATUS_MAP,
  DISCORD_STATUS_ICON_MAP,
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
  const statusColorClass = DISCORD_STATUS_COLOR_MAP[status] || 'text-ctp-subtext0';
  const StatusIcon = DISCORD_STATUS_ICON_MAP[status] || DISCORD_STATUS_ICON_MAP.offline;

  if (loading && !initialLoadComplete) {
    return (
      <div
        className="animate-fade-in flex items-center gap-2 rounded-md"
        role="status"
        aria-live="polite"
      >
        <FaSpinner className="animate-spin text-ctp-pink" size={20} aria-hidden={true} />
        <span className="text-base">Loading status...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="animate-fade-in flex items-center gap-2 rounded-md"
        role="status"
        aria-live="polite"
      >
        <FaExclamationTriangle className="text-ctp-yellow" size={18} aria-hidden={true} />
        <span className="text-base">Status unavailable</span>
      </div>
    );
  }

  const statusText = DISCORD_STATUS_MAP[status] || 'Unknown';

  const statusClass = initialLoadComplete
    ? 'flex items-center gap-2'
    : 'animate-fade-in flex items-center gap-2';

  return (
    <div className={statusClass} role="status" aria-label={`Discord status: ${statusText}`}>
      <StatusIcon size={20} className={statusColorClass} aria-hidden={true} />
      <span className="text-base">{statusText}</span>
    </div>
  );
};

export default LanyardStatus;
