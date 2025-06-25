import { platforms, preferences } from '$utils/config';

export const createForbiddenResponse = (message?: string): Response => {
  return new Response(
    JSON.stringify({
      error: message || 'Forbidden: Value does not match configured value',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};

export const validateLocation = (location: string) => preferences.location === location;

export const validateUsername = (platform: keyof typeof platforms, username: string) => {
  const configuredUsername = platforms[platform];
  return configuredUsername === username;
};
