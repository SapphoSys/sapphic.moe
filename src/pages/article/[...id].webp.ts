import { getContainerRenderer } from '@astrojs/mdx';
import Atkinson from '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff?arraybuffer';
import { Transformer } from '@napi-rs/image';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getCollection, getEntry } from 'astro:content';
import { Buffer } from 'buffer';
import type { ReactNode } from 'react';
import satori from 'satori';
import { html } from 'satori-html';

import HTMLTemplate from '$components/blog/OpenGraphTemplate.astro';
import { images } from '$utils/config';
import { getMinutesRead } from '$utils/helpers/article';
import { formatDate } from '$utils/helpers/date';

const { width, height } = images.openGraph.dimensions;

interface Props {
  title: string;
  description: string;
  created: string | Date;
}

export const getStaticPaths = async () => {
  const articles = await getCollection('articles');

  return articles.map((article) => {
    return {
      params: {
        id: article.id,
      },
      props: {
        title: article.data.title,
        description: article.data.description,
        created: article.data.created,
      },
    };
  });
};

export const GET = async (context: APIContext) => {
  const { title, description, created } = context.props as Props;
  const createdAt = formatDate(created);

  const entry = await getEntry('articles', context.params.id!);
  if (!entry) return new Response('Not Found', { status: 404 });

  const { minutesRead } = await getMinutesRead(entry);

  const container = await AstroContainer.create({
    renderers: await loadRenderers([getContainerRenderer()]),
  });

  const htmlTemplate = await container.renderToString(HTMLTemplate, {
    props: {
      title,
      description,
      created: createdAt,
      minutesRead,
    },
  });

  const imageTemplate = html(htmlTemplate);

  const svg = await satori(imageTemplate as ReactNode, {
    fonts: [
      {
        name: 'Atkinson Hyperlegible',
        data: Buffer.from(Atkinson),
        style: 'normal',
      },
    ],
    ...images.openGraph.dimensions,
  });

  const image = await Transformer.fromSvg(svg).crop(0, 0, width, height).webpLossless();

  return new Response(image, {
    headers: {
      'Content-Type': 'image/webp',
    },
  });
};
