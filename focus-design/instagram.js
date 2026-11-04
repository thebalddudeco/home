// Reuse the existing scheduled Instagram API feed from the original website.
'use strict';
(() => {
  const grid = document.querySelector('[data-instagram-grid]');
  const status = document.querySelector('[data-instagram-status]');
  if (!grid) return;
  let loading = false;
  async function refreshFeed() {
  if (loading) return;
  loading = true;
  try {
    const feedUrl = new URL('/instagram-feed.json', document.baseURI);
    const response = await fetch(feedUrl, {cache:'no-store'});
    if (!response.ok) throw new Error('Feed unavailable');
    const feed = await response.json();
    if (!['instagram-api','instagram-profile-grid'].includes(feed.source) || !Array.isArray(feed.items) || !feed.items.length) throw new Error('Feed unavailable');
    const fragment = document.createDocumentFragment();
    feed.items.slice(0,12).forEach(item => {
      const link = document.createElement('a');
      link.href = item.permalink || 'https://www.instagram.com/thebalddude.dng/';
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'View this Instagram post from @thebalddude.dng');
      const image = new Image();
      image.src = new URL(item.image, feedUrl).href;
      image.alt = item.alt || 'Recent post from @thebalddude.dng';
      image.loading = 'lazy'; image.decoding = 'async';
      link.append(image); fragment.append(link);
    });
    grid.replaceChildren(fragment);
    status.textContent = 'FROM INSTAGRAM';
  } catch {
    if (!grid.children.length) status.textContent = 'FOLLOW ON INSTAGRAM';
  } finally {
    loading = false;
  }
  }
  refreshFeed();
  setInterval(() => { if (!document.hidden) refreshFeed(); }, 10 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshFeed(); });
})();
