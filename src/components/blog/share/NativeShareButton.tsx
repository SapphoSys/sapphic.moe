import { MdShare } from 'react-icons/md';
import { type FC, useEffect, useState } from 'react';

import type { NativeShareButtonProps, ShareUrlParams } from '$types/share';

const NativeShareButton: FC<NativeShareButtonProps> = ({
  title,
  text,
  url,
  buttonClass = '',
  messageBoxClass = '',
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const [messageVisible, setMessageVisible] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (messageVisible) {
      const timer = setTimeout(() => {
        setMessageVisible(false);
        const messageBox = document.getElementById('native-share-message-box');
        if (messageBox) {
          messageBox.addEventListener(
            'transitionend',
            () => {
              setMessage(null);
              setMessageType(null);
            },
            { once: true }
          );
        } else {
          setMessage(null);
          setMessageType(null);
        }
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [messageVisible]);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setMessageVisible(true);
  };

  const handleShare = async () => {
    const shareData: ShareUrlParams = {
      title,
      text,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing the article:', error);
          showMessage('Error sharing article.', 'error');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showMessage('Article link copied to clipboard!', 'success');
      } catch (err) {
        console.error('Failed to copy link: ', err);
        showMessage('Sharing not supported on this browser.', 'error');
      }
    }
  };

  const baseMessageBoxStyles = `
    absolute bottom-full
    left-0 px-2
    mb-2
    whitespace-nowrap
    rounded-md p-2 text-sm text-ctp-base
    shadow-lg motion-safe:transition-opacity motion-safe:duration-300
    pointer-events-none
    ${messageVisible ? 'opacity-100' : 'opacity-0'} ${messageBoxClass}
  `;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleShare}
        className={`${buttonClass} rounded-md border-ctp-mauve px-3 py-2 dark:border-ctp-pink`}
        aria-label="Share this article using native share dialog"
        title="Share this article using native share dialog"
      >
        <MdShare aria-hidden={true} size={25} /> Share
      </button>

      {message && (
        <div
          id="native-share-message-box"
          className={`${baseMessageBoxStyles} ${
            messageType === 'success' ? 'bg-ctp-green' : 'bg-ctp-red'
          }`}
        >
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default NativeShareButton;
