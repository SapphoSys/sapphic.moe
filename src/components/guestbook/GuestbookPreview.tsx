import { FaLink } from 'react-icons/fa';

import { GUESTBOOK_VALID_COLORS } from '$utils/constants';
import { formatDate } from '$utils/helpers/date';
import { cn, validateUrl } from '$utils/helpers/misc';

interface GuestbookPreviewProps {
  name: string;
  message: string;
  url?: string;
  color?: string;
  previewDate: Date;
}

const GuestbookPreview = ({
  name,
  message,
  url,
  color = 'pink',
  previewDate,
}: GuestbookPreviewProps) => {
  const borderColor = GUESTBOOK_VALID_COLORS.includes(color) ? color : 'pink';
  const borderClass = `border-ctp-${borderColor}`;
  const textClass = `text-ctp-${borderColor}`;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold">Preview</h2>
      <div className={cn('flex flex-col gap-2 rounded-md border-2 bg-ctp-mantle p-4', borderClass)}>
        <div className="flex grow flex-row items-center justify-between text-center">
          <h2 className="text-xl font-bold text-ctp-subtext1">{name || 'Your name'}</h2>

          {url && validateUrl(url) && (
            <a
              href={url}
              className="items-center justify-center text-center"
              target="_blank"
              title={`A link to ${name}'s website.`}
              aria-label={`A link to ${name}'s website.`}
              data-custom-icon
            >
              <FaLink size={24} className={textClass} aria-hidden={true} />
            </a>
          )}
        </div>

        <p className="break-words text-base">{message || 'Your message will appear here'}</p>

        <div className="flex flex-row items-center justify-between">
          <time
            className="text-sm text-ctp-subtext0"
            dateTime={formatDate(previewDate, 'iso')}
            title={`Preview as of ${formatDate(previewDate, 'iso')}`}
          >
            {formatDate(previewDate, 'relative')}
          </time>
        </div>
      </div>
    </div>
  );
};

export default GuestbookPreview;
