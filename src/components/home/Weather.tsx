import { Icon } from '@iconify/react';
import { type FC, useEffect, useState } from 'react';

import useWeather from '$hooks/useWeather';
import { WEATHER_ICON_MAP } from '$utils/constants';
import { cn, playPopAudio } from '$utils/helpers/misc';

export interface WeatherProps {
  location: string;
  unit?: 'metric' | 'imperial';
  refreshInterval?: number;
}

const Weather: FC<WeatherProps> = ({ location, unit = 'metric', refreshInterval = 600000 }) => {
  const { data, loading, isRefreshing, error } = useWeather(location, unit, refreshInterval);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [displayUnit, setDisplayUnit] = useState(unit);

  useEffect(() => {
    if (!loading && (data || error || (!data && !error))) {
      if (!initialLoadComplete) setInitialLoadComplete(true);
    }
  }, [loading, data, error, initialLoadComplete]);

  const toggleUnit = () => {
    setDisplayUnit((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
    playPopAudio();
  };

  const displayTemp = data?.temperature
    ? displayUnit === 'metric'
      ? data.temperature
      : Math.round((data.temperature * 9) / 5 + 32)
    : null;

  const temperatureUnit = displayUnit === 'metric' ? '°C' : '°F';

  if (loading && !initialLoadComplete) {
    return (
      <div
        className="flex flex-row items-center justify-center gap-2 rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 dark:border-ctp-pink"
        role="status"
        aria-live="polite"
      >
        <Icon
          icon="line-md:loading-loop"
          fontSize={30}
          className="text-ctp-mauve dark:text-ctp-pink"
          aria-hidden={true}
        />
        Loading weather stats...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 text-ctp-mauve dark:border-ctp-pink dark:text-ctp-pink"
        role="alert"
        aria-live="assertive"
      >
        <div className={cn(initialLoadComplete && 'animate-fade-in-up')}>
          Error loading weather: {error.message}
        </div>
      </div>
    );
  }

  if (initialLoadComplete && !data) {
    return (
      <div
        className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 text-ctp-subtext1"
        role="status"
        aria-live="polite"
      >
        <div className={cn(initialLoadComplete && 'animate-fade-in-up')}>
          Could not retrieve weather for {location}.
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { city, country, description, iconCode } = data || {};

  const titleIcon = iconCode
    ? WEATHER_ICON_MAP[iconCode] || 'mdi:weather-cloudy'
    : 'mdi:weather-cloudy';

  return (
    <div className="flex flex-col rounded-md border-2 border-ctp-mauve bg-ctp-mantle p-4 dark:border-ctp-pink">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-base text-ctp-subtext1">Weather</h2>
        <button
          type="button"
          onClick={toggleUnit}
          className="cursor-pointer border-none bg-transparent p-0"
          title={`Current weather is ${description}. Click to toggle temperature unit to ${displayUnit === 'metric' ? 'Fahrenheit' : 'Celsius'}.`}
          aria-label={`Current weather is ${description}. Click to toggle temperature unit to ${displayUnit === 'metric' ? 'Fahrenheit' : 'Celsius'}.`}
          data-umami-event="Weather unit toggle"
        >
          <Icon
            icon={titleIcon}
            fontSize={24}
            className="text-ctp-mauve dark:text-ctp-pink"
            aria-hidden={true}
          />
        </button>
      </div>
      <div
        className={cn(
          'flex flex-col gap-1',
          initialLoadComplete && 'animate-fade-in-up',
          'md:items-center'
        )}
        role="status"
        aria-live="polite"
      >
        <p className="m-0 p-0 text-2xl font-semibold text-ctp-text md:text-3xl">
          <span aria-label={`Temperature: ${displayTemp || '--'} ${temperatureUnit}`}>
            {displayTemp || '--'}
          </span>
          {temperatureUnit}
        </p>
        <p className="m-0 p-0 text-xs text-ctp-subtext0">
          in {city}, {country}
        </p>
        {isRefreshing && (
          <Icon
            icon="line-md:loading-loop"
            fontSize={20}
            className="shrink-0 text-ctp-mauve dark:text-ctp-pink"
            aria-hidden={true}
          />
        )}
      </div>
    </div>
  );
};

export default Weather;
