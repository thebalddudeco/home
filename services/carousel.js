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
  const projectType = { 'editorial-fashion': 'Fashion + Editorial', events: 'Events + Backstage', portraits: 'Portraits', weddings: 'Weddings', commercial: 'Commercial' }[serviceKey];
  const contactCopy = {
    'editorial-fashion': ['CAMPAIGNS / LOOKBOOKS / STREET STORIES', 'MAKE IT<br />EDITORIAL.', 'STARTING RANGE / $950–$3,200+', 'Tell me about the collection, talent, locations, deliverables, and where the photographs will live. I’ll shape the right level of production around the story.'],
    events: ['FASHION WEEK / RED CARPET / AFTER DARK', 'PUT ME<br />IN THE ROOM.', 'STARTING RANGE / $750–$3,750+', 'Share the date, venue, run of show, access, guest count, and turnaround needs.'],
    portraits: ['ARTISTS / FOUNDERS / PEOPLE WITH PRESENCE', 'STEP INTO<br />THE FRAME.', 'STARTING RANGE / $650–$1,350', 'Tell me who the photographs are for, how you want to be seen, and where the images will be used.'],
    weddings: ['COURTHOUSE / INTIMATE / BEAUTIFULLY UNFORCED', 'LET IT FEEL<br />LIKE YOURS.', 'STARTING RANGE / $750–$2,750+', 'Share your date, ceremony location, guest count, timeline, and the moments that matter most.'],
    commercial: ['PRODUCT / BRAND / SOCIAL CAMPAIGNS', 'BUILD THE<br />CAMPAIGN.', 'CREATIVE FEES / $1,500–$5,000+', 'Tell me about the brand, campaign, deliverables, usage, timeline, and production needs.']
  }[serviceKey];
  const dialog = document.createElement('dialog');
  dialog.className = 'contact-dialog';
  dialog.setAttribute('aria-labelledby', 'service-contact-title');
  dialog.innerHTML = `<div class="contact-dialog-shell"><button class="contact-dialog-close" type="button" aria-label="Close contact form"><span class="material-symbols-outlined" aria-hidden="true">close</span></button><div class="contact-dialog-intro"><p class="label">${contactCopy[0]}</p><h2 id="service-contact-title">${contactCopy[1]}</h2><p class="contact-dialog-price">${contactCopy[2]}</p><p>${contactCopy[3]}</p></div><form class="contact-form" action="https://formsubmit.co/info@thebalddude.co" method="POST"><input type="hidden" name="_subject" value="NEW CLIENT" /><input type="hidden" name="_template" value="table" /><input type="hidden" name="Requested Service" value="${projectType}" /><input type="hidden" name="Starting Price Range" value="${contactCopy[2]}" /><label><span>Name *</span><input type="text" name="Name" autocomplete="name" required /></label><label><span>Email *</span><input type="email" name="email" autocomplete="email" required /></label><label><span>Phone</span><input type="tel" name="Phone" autocomplete="tel" /></label><label><span>Project type *</span><select name="Project Type" required><option>${projectType}</option><option>Fashion + Editorial</option><option>Events + Backstage</option><option>Portraits</option><option>Weddings</option><option>Commercial</option><option>Other</option></select></label><label><span>Target date</span><input type="date" name="Target Date" /></label><label class="contact-form-wide"><span>Instagram / website</span><input type="url" name="Instagram or Website" placeholder="https://" /></label><label class="contact-form-wide"><span>Tell me about the project *</span><textarea name="Project Details" rows="6" required></textarea></label><div class="contact-form-actions contact-form-wide"><button type="submit">Send inquiry <span class="material-symbols-outlined" aria-hidden="true">arrow_outward</span></button></div></form></div>`;
  document.body.appendChild(dialog);
  const closeDialog = () => dialog.close();
  dialog.querySelector('.contact-dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });
  target.querySelector('.service-button')?.addEventListener('click', (event) => {
    event.preventDefault();
    dialog.showModal();
    window.setTimeout(() => dialog.querySelector('input[name="Name"]')?.focus(), 0);
  });

  const section = document.createElement('section');
  section.className = 'gallery-room gallery-room-pink service-category-carousel';
  section.innerHTML = `<header class="gallery-room-head"><span aria-hidden="true"></span><h2 aria-hidden="true"></h2><p class="gallery-count" data-gallery-count aria-live="polite">Loading</p><div class="gallery-controls" aria-label="${label} gallery controls"><button type="button" data-carousel-prev aria-label="Previous images"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></button><button type="button" data-carousel-next aria-label="Next images"><span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button></div></header><div class="gallery-track" data-carousel-track tabindex="0" aria-label="${label} photographs"><p class="gallery-loading">Loading archive…</p></div></section>`;
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
