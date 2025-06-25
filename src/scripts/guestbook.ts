const initGuestbook = () => {
  const loadingEl = document.querySelector('[data-guestbook-loading]');
  const contentEl = document.querySelector('[data-requires-js]');

  if (loadingEl && contentEl) {
    contentEl.classList.remove('hidden');
    loadingEl.remove();
  }
};

document.addEventListener('DOMContentLoaded', initGuestbook);
document.addEventListener('astro:page-load', initGuestbook);
