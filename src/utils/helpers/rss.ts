import { transform, walk } from 'ultrahtml';
import sanitize from 'ultrahtml/transformers/sanitize';

export const fixLinks = async (html: string, baseUrl: string) => {
  return await transform(html, [
    async (node) => {
      await walk(node, (node) => {
        if (node.name === 'a' && node.attributes.href?.startsWith('/')) {
          node.attributes.href = baseUrl + node.attributes.href;
        }
        if (node.name === 'img' && node.attributes.src?.startsWith('/')) {
          node.attributes.src = baseUrl + node.attributes.src;
        }
      });
      return node;
    },

    sanitize({ dropElements: ['script', 'style'] }),
  ]);
};
