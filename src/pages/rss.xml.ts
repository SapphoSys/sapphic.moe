import { getContainerRenderer } from '@astrojs/mdx';
import reactRenderer from '@astrojs/react/server.js';
import RSS, { type RSSFeedItem } from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getCollection } from 'astro:content';
import { dedent } from 'ts-dedent';

import RSSRenderer from '$components/blog/RSS.astro';
import { footerLinks } from '$utils/config';
import { images, rss, site } from '$utils/config';
import { getMinutesRead } from '$utils/helpers/article';
import { formatDate } from '$utils/helpers/date';
import { fixLinks } from '$utils/helpers/rss';
import { getPackageVersions, getWebsiteVersion } from '$utils/helpers/server';

export const GET: APIRoute = async ({ generator }) => {
  let baseUrl = site.url;
  if (baseUrl.at(-1) === '/') baseUrl = baseUrl.slice(0, -1);

  const articles = await getCollection('articles');

  const items: RSSFeedItem[] = [];
  const container = await AstroContainer.create({
    renderers: await loadRenderers([getContainerRenderer()]),
  });

  container.addServerRenderer({
    name: '@astrojs/react',
    renderer: reactRenderer,
  });

  for (const article of articles) {
    let html = await container.renderToString(RSSRenderer, {
      params: { id: article.id },
    });

    html = await fixLinks(html, baseUrl);

    const { minutesRead } = await getMinutesRead(article);

    items.push({
      title: article.data.title,
      description: article.data.description,
      pubDate: new Date(article.data.created),
      link: `/article/${article.id}`,
      categories: article.data.tags,
      content: html,
      customData: dedent`
        <prettyDate>${formatDate(article.data.created)}</prettyDate>
        <minutesRead>${minutesRead}</minutesRead>
      `,
    });
  }

  const { astroVersion, reactVersion } = await getPackageVersions();
  const { name, date, hash, version } = await getWebsiteVersion();
  const hashURL = `https://github.com/SapphoSys/sapphic.moe/commit/${hash}`;

  return await RSS({
    title: rss.title,
    description: rss.description,
    site: site.url,
    items,
    stylesheet: rss.stylesheet,

    customData: dedent`
      <webMaster>${rss.email}</webMaster>
      <generator>${generator}</generator>
      <image>
        <url>${baseUrl}${images.path}</url>
        <title>${rss.title}</title>
        <link>${baseUrl}</link>
      </image>
      <versions>
        <website>${version}</website>
        <websiteName>${name}</websiteName>
        <websiteHash>${hash}</websiteHash>
        <websiteHashURL>${hashURL}</websiteHashURL>
        <websiteDate>${formatDate(date, 'iso')}</websiteDate>
        <astro>${astroVersion}</astro>
        <react>${reactVersion}</react>
      </versions>
      <footerLinks>
        ${[...Array(4)]
          .map(
            (_, rowIndex) => `
          <row>
            <left>
              <text>${footerLinks[0][rowIndex].text}</text>
              <url>${footerLinks[0][rowIndex].link}</url>
              <icon>${footerLinks[0][rowIndex].icon}</icon>
              <newWindow>${footerLinks[0][rowIndex].new ? 'true' : 'false'}</newWindow>
            </left>
            <right>
              <text>${footerLinks[1][rowIndex].text}</text>
              <url>${footerLinks[1][rowIndex].link}</url>
              <icon>${footerLinks[1][rowIndex].icon}</icon>
              <newWindow>${footerLinks[1][rowIndex].new ? 'true' : 'false'}</newWindow>
            </right>
          </row>
        `
          )
          .join('')}
      </footerLinks>
    `,
  });
};
