export interface WeatherCacheEntry {
  data: ApiWeatherData;
  timestamp: number;
}

export interface ApiWeatherData {
  city: string;
  country: string;
  temperature: number;
  description: string;
  iconCode: string;
  iconUrl: string;
  feelsLike: number;
  windSpeed: number;
  unit: 'metric' | 'imperial';
}

interface OWMCoordinates {
  lon: number;
  lat: number;
}

interface OWMWeather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface OWMMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

interface OWMWind {
  speed: number;
  deg: number;
  gust?: number;
}

interface OWMRainSnow {
  '1h'?: number;
  '3h'?: number;
}

interface OWMClouds {
  all: number;
}

interface OWMSystem {
  type: number;
  id: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface OpenWeatherMapApiResponse {
  coord: OWMCoordinates;
  weather: OWMWeather[];
  base: string;
  main: OWMMain;
  visibility: number;
  wind: OWMWind;
  rain?: OWMRainSnow;
  snow?: OWMRainSnow;
  clouds: OWMClouds;
  dt: number;
  sys: OWMSystem;
  timezone: number;
  id: number;
  name: string;
  cod: number;
  message?: string;
}
