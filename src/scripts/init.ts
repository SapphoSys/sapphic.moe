import { initJsContent } from '$utils/helpers/misc';

import '$scripts/guestbook';

document.addEventListener('astro:page-load', () => {
  initJsContent();
});
