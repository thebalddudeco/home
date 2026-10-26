document.documentElement.classList.add('js-ready');

const scrollWindow = document.querySelector('.screen-scroll');
const pointer = document.querySelector('.rf-pointer');
const scaleNumbers = [...document.querySelectorAll('.rf-scale b')];
const scale = document.querySelector('.rf-scale');
const rangefinder = document.querySelector('.rangefinder');
const toneTargets = [...document.querySelectorAll('.rf-scale b, .rf-dot, .rf-pointer')];
const toneCanvas = document.createElement('canvas');
toneCanvas.width = toneCanvas.height = 1;
const toneContext = toneCanvas.getContext('2d', {willReadFrequently: true});

const parseColor = (value) => {
  const match = value && value.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(',').map(Number);
  if (parts.length < 3 || (parts[3] !== undefined && parts[3] === 0)) return null;
  return parts.slice(0, 3);
};

const luminanceAt = (x, y) => {
  const previousVisibility = rangefinder ? rangefinder.style.visibility : '';
  if (rangefinder) rangefinder.style.visibility = 'hidden';
  const nodes = document.elementsFromPoint(x, y).filter((candidate) => !rangefinder || !rangefinder.contains(candidate));
  let luminance = null;
  for (const node of nodes) {
    if (node === document.body) continue;
    if ((node.tagName === 'IMG' || node.tagName === 'VIDEO' || node.tagName === 'CANVAS') && toneContext) {
      try {
        const rect = node.getBoundingClientRect();
        const sourceWidth = node.videoWidth || node.naturalWidth || node.width;
        const sourceHeight = node.videoHeight || node.naturalHeight || node.height;
        if (sourceWidth && sourceHeight && rect.width && rect.height) {
          const objectFitScale = Math.max(rect.width / sourceWidth, rect.height / sourceHeight);
          const renderedWidth = sourceWidth * objectFitScale;
          const renderedHeight = sourceHeight * objectFitScale;
          const offsetX = (rect.width - renderedWidth) * 0.5;
          const objectPositionY = getComputedStyle(node).objectPosition.includes('35%') ? 0.35 : 0.5;
          const offsetY = (rect.height - renderedHeight) * objectPositionY;
          const sx = Math.max(0, Math.min(sourceWidth - 1, ((x - rect.left - offsetX) / objectFitScale)));
          const sy = Math.max(0, Math.min(sourceHeight - 1, ((y - rect.top - offsetY) / objectFitScale)));
          toneContext.clearRect(0, 0, 1, 1);
          toneContext.drawImage(node, sx, sy, 1, 1, 0, 0, 1, 1);
          const pixel = toneContext.getImageData(0, 0, 1, 1).data;
          luminance = 0.2126 * pixel[0] + 0.7152 * pixel[1] + 0.0722 * pixel[2];
          break;
        }
      } catch (_) {}
    }
  }
  if (luminance === null) for (const node of nodes) {
    if (node === document.body) continue;
    const background = parseColor(getComputedStyle(node).backgroundColor);
    if (background) {
      luminance = 0.2126 * background[0] + 0.7152 * background[1] + 0.0722 * background[2];
      break;
    }
  }
  if (rangefinder) rangefinder.style.visibility = previousVisibility;
  return luminance === null ? 245 : luminance;
};

const updateRangefinderTone = () => {
  if (!rangefinder) return;
  // Difference blending handles inversion at every rendered pixel. A single
  // sampled gray value would fail whenever a marker spans multiple colors.
  toneTargets.forEach((target) => {
    target.style.removeProperty('color');
    target.style.removeProperty('background');
  });
};
if (scrollWindow && pointer) {
  const updateRangefinder = () => {
    const max = scrollWindow.scrollHeight - scrollWindow.clientHeight;
    const progress = max > 0 ? scrollWindow.scrollTop / max : 0;
    const trackWidth = scale ? scale.clientWidth : 260;
    // Align the pointer center with the center of the first/last 3px dot.
    const trackStart = 10.5;
    // The reference rangefinder advances on its actual dot positions. Snap
    // the pointer to one of the 13 dots so its point is never between dots.
    const dotCount = 13;
    const dotIndex = Math.round(progress * (dotCount - 1));
    const pointerPosition = trackStart + (dotIndex / (dotCount - 1)) * Math.max(0, trackWidth - (trackStart * 2));
    pointer.style.left = `${pointerPosition}px`;
    scaleNumbers.forEach((number, index) => {
      const isUnderPointer = dotIndex === index * 2;
      number.classList.toggle('is-crossed', isUnderPointer);
    });
    updateRangefinderTone();
  };
  scrollWindow.addEventListener('scroll', updateRangefinder, { passive: true });
  window.addEventListener('resize', updateRangefinder);
  window.addEventListener('load', updateRangefinderTone);
  document.querySelectorAll('img').forEach((image) => image.addEventListener('load', updateRangefinderTone));
  document.querySelectorAll('video').forEach((video) => video.addEventListener('loadeddata', updateRangefinderTone));
  updateRangefinder();
}

const updateLocalTime = () => {
  const date = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: '2-digit', month: '2-digit', day: '2-digit'
  }).format(new Date());
  const now = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(new Date());
  document.querySelectorAll('[data-local-date]').forEach((node) => { node.textContent = date; });
  document.querySelectorAll('[data-local-time]').forEach((node) => { node.textContent = now; });
};
updateLocalTime();
window.setInterval(updateLocalTime, 1000);

document.querySelectorAll('.home-project-button').forEach((button) => {
  button.addEventListener('click', (event) => {
    const form = document.querySelector('#contact-form');
    if (!form) return;
    event.preventDefault();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('.editorial-nav a').forEach((link) => {
  link.addEventListener('click', (event) => {
    const selector = link.getAttribute('href');
    if (!selector || !selector.startsWith('#')) return;
    if (selector === '#top') {
      event.preventDefault();
      // The homepage is an internal scrolling card, so reset every possible
      // scroll owner instead of relying on the browser's hash positioning.
      if (scrollWindow) scrollWindow.scrollTop = 0;
      const tabletScreen = document.querySelector('.tablet-screen');
      if (tabletScreen) tabletScreen.scrollTop = 0;
      window.scrollTo(0, 0);
      window.history.replaceState(null, '', '#top');
      return;
    }
    const target = selector === '#about'
      ? document.querySelector('.editorial-intro')
      : selector === '#work'
        ? document.querySelector('.editorial-story-one')
      : selector === '#archive'
        ? document.querySelector('.editorial-story-one')
        : (selector ? document.querySelector(selector) : null);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    window.history.replaceState(null, '', selector);
  });
});

document.querySelectorAll('.wordmark[href="#top"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    if (scrollWindow) scrollWindow.scrollTop = 0;
    const tabletScreen = document.querySelector('.tablet-screen');
    if (tabletScreen) tabletScreen.scrollTop = 0;
    window.scrollTo(0, 0);
    window.history.replaceState(null, '', '#top');
  });
});

document.querySelectorAll('.home-services a, .home-wedding a, .editorial-intro-contact a').forEach((link) => {
  link.addEventListener('click', (event) => {
    const form = document.querySelector('#contact-form');
    if (!form) return;
    event.preventDefault();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('.home-contact-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(`Photography inquiry: ${data.get('project')}`);
    const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`);
    window.location.href = `mailto:info@thebalddude.co?subject=${subject}&body=${body}`;
  });
});

// Keep action labels typographic and quiet; decorative arrow glyphs are not part
// of the navigation language.
document.querySelectorAll('a, button').forEach((element) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => { node.nodeValue = node.nodeValue.replace(/[↗↓↑←→]/g, ''); });
});
