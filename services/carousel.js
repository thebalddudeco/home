(() => {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '../services.css?v=20260925-21';
  document.head.appendChild(style);

  const path = window.location.pathname;
  const pageNames = { 'editorial-fashion': 'Editorial + Fashion', events: 'Events + Backstage', portraits: 'Portraits', weddings: 'Courthouse Weddings', commercial: 'Commercial' };
  const serviceKey = Object.keys(pageNames).find((name) => path.includes(`/services/${name}/`));
  const archiveKey = { 'editorial-fashion': 'editorial-fashion', events: 'events', portraits: 'studio-photography', weddings: 'wedding', commercial: 'studio-photography' }[serviceKey];
  const archiveUrl = 'https://huggingface.co/datasets/TheBaldDudeCo/website-gallery/resolve/main/archive.json';
  const target = document.querySelector('.service-cta');
  if (!serviceKey || !target) return;

  const label = pageNames[serviceKey];
  const section = document.createElement('section');
  section.className = 'gallery-room gallery-room-black service-category-carousel';
  section.innerHTML = `<header class="gallery-room-head"><span>Selected work</span><h2>${label}</h2><p class="gallery-count" data-gallery-count aria-live="polite">Loading</p><div class="gallery-controls" aria-label="${label} gallery controls"><button type="button" data-carousel-prev aria-label="Previous images"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></button><button type="button" data-carousel-next aria-label="Next images"><span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button></div></header><div class="gallery-track" data-carousel-track tabindex="0" aria-label="${label} photographs"><p class="gallery-loading">Loading archive…</p></div></section>`;
  target.before(section);

  const track = section.querySelector('[data-carousel-track]');
  const count = section.querySelector('[data-gallery-count]');
  const move = (direction) => {
    const distance = Math.max(track.clientWidth * 0.78, 300);
    const max = Math.max(track.scrollWidth - track.clientWidth, 0);
    if (direction > 0 && track.scrollLeft >= max - 4) return track.scrollTo({ left: 0, behavior: 'smooth' });
    if (direction < 0 && track.scrollLeft <= 4) return track.scrollTo({ left: max, behavior: 'smooth' });
    track.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };
  section.querySelector('[data-carousel-prev]').addEventListener('click', () => move(-1));
  section.querySelector('[data-carousel-next]').addEventListener('click', () => move(1));
  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  });

  fetch(`${archiveUrl}?v=6`, { mode: 'cors', cache: 'no-store' })
    .then((response) => { if (!response.ok) throw new Error('Archive request failed'); return response.json(); })
    .then((archive) => {
      const entries = archive.albums.filter((album) => album.id === archiveKey || album.id.startsWith(`${archiveKey}--`)).flatMap((album) => album.items.map((item) => ({ item, name: album.name.split(' — ').slice(1).join(' / ') || album.name })));
      if (!entries.length) throw new Error('No images for category');
      const fragment = document.createDocumentFragment();
      entries.forEach(({ item, name }, index) => {
        const figure = document.createElement('figure');
        const image = document.createElement('img');
        image.src = item.url; image.alt = `${name} photograph ${index + 1}`; image.loading = 'lazy'; image.decoding = 'async';
        figure.appendChild(image);
        const caption = document.createElement('figcaption');
        const number = document.createElement('span'); number.textContent = String(index + 1).padStart(3, '0');
        caption.append(number, document.createTextNode(name)); figure.appendChild(caption); fragment.appendChild(figure);
      });
      track.replaceChildren(fragment); count.textContent = `${entries.length} frames`;
    })
    .catch(() => {
      count.textContent = 'Archive unavailable';
      const message = document.createElement('p'); message.className = 'gallery-error'; message.textContent = 'The archive could not load.'; track.replaceChildren(message);
    });
})();
