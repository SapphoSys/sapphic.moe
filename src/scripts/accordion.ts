document.addEventListener('astro:page-load', () => {
  const details = document.querySelectorAll('details');

  details.forEach((detail) => {
    const content = detail.querySelector('[data-accordion-content]') as HTMLElement | null;
    const summary = detail.querySelector('summary') as HTMLElement | null;

    if (!content || !summary) return;

    if (summary.dataset.disabled === 'true') return;

    if (detail.open) {
      requestAnimationFrame(() => {
        content.style.height = `${content.scrollHeight}px`;
      });
    } else {
      content.style.height = '0';
    }

    summary.addEventListener('click', (e) => {
      e.preventDefault();

      if (content.style.height === '') content.style.height = `${content.scrollHeight}px`;

      if (detail.open) {
        const startHeight = content.scrollHeight;
        content.style.height = `${startHeight}px`;

        void content.offsetHeight;

        content.style.height = '0';

        setTimeout(() => {
          detail.open = false;
        }, 200);
      } else {
        detail.open = true;
        content.style.height = '0';

        void content.offsetHeight;

        content.style.height = `${content.scrollHeight}px`;

        setTimeout(() => {
          content.style.height = 'auto';
        }, 200);
      }
    });
  });
});
