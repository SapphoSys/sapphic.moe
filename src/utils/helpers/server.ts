import { dependencies, name, version } from '../../../package.json';
import { isProduction } from '$utils/helpers/misc';

export const getCommitInfo = async () => {
  if (isProduction) {
    const { COMMIT_HASH, COMMIT_DATE } = await import('astro:env/server');

    return { hash: COMMIT_HASH, date: COMMIT_DATE };
  } else {
    const childProcess = await import('node:child_process');

    const hash = childProcess.execSync('git rev-parse --short HEAD').toString().trim();
    const date = childProcess.execSync('git log -1 --format=%cd --date=short').toString().trim();

    return { hash, date };
  }
};

export const getWebsiteVersion = async () => {
  const { hash, date } = await getCommitInfo();

  return { name, date, hash, version };
};

export const getPackageVersions = async () => {
  const astroVersion = dependencies['astro']?.replace(/^[~^><=]/, '') ?? 'unknown';
  const reactVersion = dependencies['react']?.replace(/^[~^><=]/, '') ?? 'unknown';

  return { astroVersion, reactVersion };
};
