export const cn = (...classes: (string | boolean)[]) => classes.filter(Boolean).join(' ');
export const isProduction = import.meta.env.MODE === 'production';

export const validateUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const initJsContent = () => {
  document.querySelectorAll('[data-requires-js]').forEach((el) => {
    el.classList.remove('hidden');
  });
};

export const playPopAudio = async () => {
  const audio = new Audio('/pop.mp3');

  audio.preload = 'auto';

  return audio.play();
};
