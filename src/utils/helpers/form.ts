export const isValidUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

    const suspiciousPatterns = [
      /[?&](redirect|url|next|back|return|goto|continue|destination|target)=/i,
      /^(file|ftp|ws|wss|data|javascript|vbscript):/i,
      /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/,
      /^(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)/i,
      /:[0-9]+$/,
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(urlString))) return false;

    if (url.username || url.password || url.href.includes('@')) return false;

    const punycodeHostname = url.hostname.toLowerCase();
    const hostnamePattern = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!hostnamePattern.test(punycodeHostname)) return false;

    return true;
  } catch {
    return false;
  }
};

export const containsSuspiciousContent = (input: string) => {
  const htmlRegex = /<[^>]*>/;
  if (htmlRegex.test(input)) return true;

  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
    /onclick/i,
    /onmouseover/i,
    /eval\(/i,
    /alert\(/i,
    /document\./i,
    /window\./i,
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /<input/i,
    /<textarea/i,
    /<button/i,
    /<style/i,
    /<img/i,
    /<link/i,
    /<svg/i,
    /<math/i,
    /<canvas/i,
    /<video/i,
    /<audio/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(input));
};
