import { format } from 'date-fns';
import type { FC } from 'react';

import type { AniListMedia } from '$types/anilist';
import { cn } from '$utils/helpers/misc';

interface AnimeCardProps {
  anime: AniListMedia;
  showProgress: boolean;
}

const AnimeCard: FC<AnimeCardProps> = ({ anime, showProgress }) => {
  return (
    <a
      key={anime.id}
      href={anime.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group relative block aspect-[2/3] overflow-hidden rounded-md',
        'border-2 border-transparent',
        'hover:border-ctp-mauve hover:opacity-100 dark:hover:border-ctp-pink',
        'focus:outline-none focus:ring-2 focus:ring-ctp-pink focus:ring-offset-2 focus:ring-offset-ctp-base'
      )}
      aria-label={`${anime.title.english || anime.title.romaji}${
        showProgress && anime.progress ? ` - Progress: ${anime.progress} episodes` : ''
      }${anime.averageScore ? ` - Score: ${anime.averageScore}%` : ''}${
        anime.completedAt ? ` - Completed on ${format(anime.completedAt * 1000, 'PPP')}` : ''
      }`}
    >
      <img
        src={anime.coverImage.large}
        alt={`Cover art for ${anime.title.english || anime.title.romaji}`}
        className={cn(
          'h-full w-full object-cover',
          'motion-safe:transition motion-safe:duration-300',
          'group-hover:opacity-90',
          'group-hover:blur-sm'
        )}
        loading="lazy"
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ctp-mantle/80 p-4 text-center opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-300">
        <p className="w-full text-xl font-bold text-ctp-text">
          {anime.title.english || anime.title.romaji}
        </p>

        {showProgress && anime.progress && (
          <p className="text-sm text-ctp-subtext0">
            Progress: {anime.progress} {anime.episodes ? `/ ${anime.episodes}` : ''} episodes
          </p>
        )}

        {anime.averageScore && (
          <p className="text-sm text-ctp-subtext0">Score: {anime.averageScore}%</p>
        )}

        {!showProgress && anime.completedAt && (
          <p className="text-sm text-ctp-subtext0">
            Completed on {format(anime.completedAt * 1000, 'PPP')}
          </p>
        )}
      </div>
    </a>
  );
};

export default AnimeCard;
