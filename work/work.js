const archiveUrl = 'https://huggingface.co/datasets/TheBaldDudeCo/website-gallery/resolve/main/archive.json';

const carousels = Array.from(document.querySelectorAll('[data-carousel]'));

const imageFocalPoints = {
  'dscf0586.webp': '25% 50%',
  'dscf0588.webp': '72% 50%',
  'dscf0606.webp': '75% 50%',
  'dscf0609.webp': '25% 50%',
  'dscf0880-1.webp': '77% 50%',
  'dscf0884-1.webp': '60% 50%',
  'dscf0965-1.webp': '58% 50%',
  'dscf0966-1.webp': '54% 50%',
  'dscf0971-1.webp': '32% 50%'
};

const moveCarousel = (track, direction) => {
  const distance = Math.max(track.clientWidth * 0.78, 300);
  const startScroll = Math.max((track.firstElementChild?.offsetLeft || 0) - track.offsetLeft, 0);
  const maxScroll = Math.max(track.scrollWidth - track.clientWidth, 0);
  const atStart = track.scrollLeft <= startScroll + 4;
  const atEnd = track.scrollLeft >= maxScroll - 4;

  if (direction > 0 && atEnd) {
    track.scrollTo({ left: startScroll, behavior: 'smooth' });
    return;
  }

  if (direction < 0 && atStart) {
    track.scrollTo({ left: maxScroll, behavior: 'smooth' });
    return;
  }

  track.scrollBy({ left: direction * distance, behavior: 'smooth' });
};

carousels.forEach((carousel) => {
  const track = carousel.querySelector('[data-carousel-track]');
  if (!track) return;

  carousel.querySelector('[data-carousel-prev]')?.addEventListener('click', () => moveCarousel(track, -1));
  carousel.querySelector('[data-carousel-next]')?.addEventListener('click', () => moveCarousel(track, 1));
  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); moveCarousel(track, -1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); moveCarousel(track, 1); }
  });
});

const createMediaCard = (item, albumName, index) => {
  const figure = document.createElement('figure');
  if (item.height > item.width) figure.classList.add('gallery-tall');

  if (item.type === 'video') {
    const video = document.createElement('video');
    video.src = item.url;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', `${albumName} motion frame ${index + 1}`);
    figure.appendChild(video);
    figure.addEventListener('pointerenter', () => video.play().catch(() => {}));
    figure.addEventListener('pointerleave', () => video.pause());
  } else {
    const image = document.createElement('img');
    image.src = item.url;
    image.alt = `${albumName} photograph ${index + 1}`;
    image.loading = 'lazy';
    image.decoding = 'async';
    const fileName = decodeURIComponent(new URL(item.url).pathname.split('/').pop()).toLowerCase();
    image.style.objectPosition = imageFocalPoints[fileName] || '50% 50%';
    figure.appendChild(image);
  }

  const caption = document.createElement('figcaption');
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(3, '0');
  caption.append(number, document.createTextNode(albumName));
  figure.appendChild(caption);
  return figure;
};

const localGallery = {
  events: ['hero-sony-focus-dscf0768.jpg', 'sony-rooftop-motion-poster.jpg', 'fashion4ukraine-after-dark-poster.jpg', 'fashion4ukraine-backstage-poster.jpg', 'fashion4ukraine-blue-hour.jpg', 'chrome-visor.jpg', 'runway-floral.jpg', 'hero-backstage-gaze.jpg'],
  'editorial-fashion': ['runway-floral.jpg', 'chrome-visor.jpg', 'fashion4ukraine-petal-flash.jpg', 'leopard-crown.jpg', 'magenta-feather.jpg', 'hero-model.jpg', 'runway-white.jpg', 'hero-structured-black.jpg'],
  'street-photography': ['hero-backstage-gaze.jpg', 'justin-von-braun-portrait.png', 'hero-structured-black.jpg', 'chrome-visor.jpg', 'runway-floral.jpg', 'magenta-feather.jpg', 'hero-model.jpg', 'leopard-crown.jpg'],
  'studio-photography': ['hero-model.jpg', 'hero-structured-black.jpg', 'magenta-feather.jpg', 'leopard-crown.jpg', 'chrome-visor.jpg', 'justin-von-braun-portrait.png', 'runway-white.jpg', 'hero-backstage-gaze.jpg'],
  wedding: ['wedding-joyce-alex-balcony.jpg', 'wedding-joyce-alex-kiss.jpg', 'wedding-joyce-alex-family.jpg', 'wedding-joyce-alex-sidewalk.jpg', 'wedding-joyce-alex-couch.jpg', 'wedding-joyce-alex-confetti.jpg', 'wedding-joyce-alex-sunglasses.jpg', 'wedding-joyce-alex-carry.jpg']
};

const loadArchive = async () => {
  try {
    const response = await fetch(`${archiveUrl}?v=5`, { mode: 'cors', cache: 'no-store' });
    if (!response.ok) throw new Error(`Archive request failed with ${response.status}`);
    const archive = await response.json();

    carousels.forEach((carousel) => {
      const category = carousel.dataset.gallery;
      const track = carousel.querySelector('[data-carousel-track]');
      const count = carousel.querySelector('[data-gallery-count]');
      const albums = archive.albums.filter((album) => album.id === category || album.id.startsWith(`${category}--`));
      const entries = albums.flatMap((album) => album.items.map((item) => ({ item, albumName: album.name.split(' — ').slice(1).join(' / ') || album.name })));

      const fragment = document.createDocumentFragment();
      entries.forEach(({ item, albumName }, index) => fragment.appendChild(createMediaCard(item, albumName, index)));
      track.replaceChildren(fragment);
      count.textContent = `${entries.length} frame${entries.length === 1 ? '' : 's'}`;
    });
  } catch (error) {
    carousels.forEach((carousel) => {
      const track = carousel.querySelector('[data-carousel-track]');
      const count = carousel.querySelector('[data-gallery-count]');
      const fallback = (localGallery[carousel.dataset.gallery] || []).map((file) => ({ type: 'image', url: '../assets/' + file, width: 3, height: 4 }));
      const fragment = document.createDocumentFragment();
      fallback.forEach((item, index) => fragment.appendChild(createMediaCard(item, carousel.dataset.gallery.replaceAll('-', ' '), index)));
      track.replaceChildren(fragment);
      count.textContent = fallback.length + ' frames';
    });
  }
};

loadArchive();

const archiveContactTrigger = document.querySelector('.archive-cta-button');
if (archiveContactTrigger) {
  const dialog = document.createElement('dialog');
  dialog.className = 'contact-dialog';
  dialog.setAttribute('aria-labelledby', 'archive-contact-title');
  dialog.innerHTML = '<div class="contact-dialog-shell"><button class="contact-dialog-close" type="button" aria-label="Close contact form"><span class="material-symbols-outlined" aria-hidden="true">close</span></button><div class="contact-dialog-intro"><p class="label">NEW WORK / NEW YORK + WORLDWIDE</p><h2 id="archive-contact-title">TELL ME WHAT<br />WE’RE MAKING.</h2><p class="contact-dialog-price">CUSTOM COMMISSIONS / QUOTED TO SCOPE</p><p>Give me the shape of the project. I’ll reply directly with availability, questions, and the clearest next step.</p></div><form class="contact-form" action="https://formsubmit.co/info@thebalddude.co" method="POST"><input type="hidden" name="_subject" value="NEW CLIENT" /><input type="hidden" name="_template" value="table" /><input type="hidden" name="Requested Service" value="General inquiry" /><input type="hidden" name="Starting Price Range" value="Custom quote" /><label><span>Name *</span><input type="text" name="Name" autocomplete="name" required /></label><label><span>Email *</span><input type="email" name="email" autocomplete="email" required /></label><label><span>Phone</span><input type="tel" name="Phone" autocomplete="tel" /></label><label><span>Project type *</span><select name="Project Type" required><option value="">Choose one</option><option>Fashion + Editorial</option><option>Events + Backstage</option><option>Portraits</option><option>Weddings</option><option>Commercial</option><option>Other</option></select></label><label><span>Target date</span><input type="date" name="Target Date" /></label><label class="contact-form-wide"><span>Instagram / website</span><input type="url" name="Instagram or Website" placeholder="https://" /></label><label class="contact-form-wide"><span>Tell me about the project *</span><textarea name="Project Details" rows="6" required></textarea></label><div class="contact-form-actions contact-form-wide"><button type="submit">Send inquiry <span class="material-symbols-outlined" aria-hidden="true">arrow_outward</span></button></div></form></div>';
  document.body.appendChild(dialog);
  const close = () => dialog.close();
  dialog.querySelector('.contact-dialog-close').addEventListener('click', close);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  archiveContactTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    dialog.showModal();
    window.setTimeout(() => dialog.querySelector('input[name="Name"]')?.focus(), 0);
  });
}
