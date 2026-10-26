(() => {
  if (window.matchMedia('(max-width: 760px)').matches) {
    document.querySelectorAll('.work-pull-quote strong').forEach((label) => {
      label.textContent = 'Flash First.';
    });
    const mobileCopy = [
      ['.home-wedding h2', 'Vows in print.'],
      ['.editorial-intro-manifesto h2', 'Photography for People, Events, and Brands.'],
      ['.home-reels h2', 'The flash keeps moving.'],
      ['.home-project-button', 'Get in front of my camera.'],
      ['.home-instagram h3', 'Your story is already happening. Let’s photograph it well.'],
      ['.home-cases header h2', 'See the work in context.'],
      ['.home-playlist h3', 'IN THE CAVERN']
    ];
    mobileCopy.forEach(([selector, copy]) => {
      document.querySelectorAll(selector).forEach((element) => {
        element.textContent = copy;
      });
    });
    document.querySelectorAll('.home-project-button').forEach((element) => {
      element.innerHTML = 'Get in front<br />of my camera.';
    });
  }

  document.querySelectorAll('.mobile-menu-toggle').forEach((toggle) => {
    const header = toggle.closest('.topbar');
    const nav = header?.querySelector('.editorial-nav');
    if (!header || !nav) return;

    const close = () => {
      header.classList.remove('mobile-menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    };

    toggle.addEventListener('click', () => {
      const open = !header.classList.contains('mobile-menu-open');
      header.classList.toggle('mobile-menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
  });
})();
