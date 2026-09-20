const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let checkerTargetIndex = 0;

const siteMenu = document.querySelector('.nav-screen');
const menuTrigger = document.querySelector('.menu-trigger');
const menuClose = document.querySelector('.menu-close');
const menuLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
const menuPreviews = Array.from(document.querySelectorAll('[data-nav-preview]'));
const menuPreview = document.querySelector('.nav-preview');

const syncMenuDividers = () => {
  if (!siteMenu?.open || !menuPreview || !menuLinks.length) return;
  const menuRect = siteMenu.getBoundingClientRect();
  const previewRect = menuPreview.getBoundingClientRect();
  const cutRatio = Number.parseFloat(getComputedStyle(menuPreview).getPropertyValue('--cut-ratio')) || 0;
  const cutAtTop = previewRect.left + previewRect.width * cutRatio;
  const cutAtBottom = previewRect.left;

  menuLinks.forEach((link) => {
    const rowBottom = link.getBoundingClientRect().bottom;
    const progress = Math.min(1, Math.max(0, (rowBottom - menuRect.top) / menuRect.height));
    const cutEdge = cutAtTop + (cutAtBottom - cutAtTop) * progress;
    link.style.setProperty('--line-width', `${Math.max(0, cutEdge - menuRect.left - 12)}px`);
  });
};

const selectMenuPreview = (targetIndex) => {
  menuPreviews.forEach((preview) => {
    preview.classList.toggle('is-active', preview.dataset.navPreview === String(targetIndex));
  });
};

if (siteMenu && menuTrigger) {
  menuTrigger.addEventListener('click', () => {
    selectMenuPreview(0);
    siteMenu.showModal();
    menuTrigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    requestAnimationFrame(syncMenuDividers);
  });

  const closeSiteMenu = () => {
    if (siteMenu.open) siteMenu.close();
  };

  menuClose?.addEventListener('click', closeSiteMenu);
  menuLinks.forEach((link) => {
    const showLinkPreview = () => selectMenuPreview(link.dataset.navTarget);
    link.addEventListener('pointerenter', showLinkPreview);
    link.addEventListener('focus', showLinkPreview);
    link.addEventListener('click', closeSiteMenu);
  });

  siteMenu.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeSiteMenu();
  });
  siteMenu.addEventListener('close', () => {
    menuTrigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
  window.addEventListener('resize', syncMenuDividers);
  document.fonts?.ready.then(syncMenuDividers);
}

const aboutPortrait = document.querySelector('.portrait-wrap');
const aboutTitle = document.querySelector('#about-title');
const aboutWordmark = document.querySelector('.about-wordmark');
let aboutAlignmentFrame;

const syncAboutPortrait = () => {
  if (!aboutPortrait || !aboutTitle) return;
  aboutPortrait.style.marginTop = '0px';
  if (window.matchMedia('(max-width: 760px)').matches) return;

  const capOffset = parseFloat(getComputedStyle(aboutTitle).fontSize) * 0.065;
  const offset = Math.round(aboutTitle.getBoundingClientRect().top - aboutPortrait.getBoundingClientRect().top + capOffset);
  aboutPortrait.style.marginTop = `${Math.max(0, offset)}px`;
};

const queueAboutPortraitSync = () => {
  window.cancelAnimationFrame(aboutAlignmentFrame);
  aboutAlignmentFrame = window.requestAnimationFrame(syncAboutPortrait);
};

queueAboutPortraitSync();
window.addEventListener('load', queueAboutPortraitSync);
window.addEventListener('resize', queueAboutPortraitSync);
aboutWordmark?.addEventListener('load', queueAboutPortraitSync, { once: true });
document.fonts?.ready.then(queueAboutPortraitSync);

const initializeCheckerReveal = (target) => {
  if (target.classList.contains('checker-reveal')) return;
  const targetIndex = checkerTargetIndex;
  checkerTargetIndex += 1;
  target.classList.add('checker-reveal');

  if (reducedMotion) {
    target.classList.add('visible');
    return target;
  }

  const grid = document.createElement('span');
  grid.className = 'checker-reveal-grid';
  grid.setAttribute('aria-hidden', 'true');

  for (let row = 0; row < 6; row += 1) {
    for (let column = 0; column < 10; column += 1) {
      const tile = document.createElement('i');
      const sequence = (row * 7 + column * 11 + targetIndex * 5) % 22;
      tile.style.setProperty('--tile-delay', `${sequence * 17}ms`);
      tile.style.setProperty('--tile-tone', (row + column + targetIndex) % 2 ? 'var(--ink)' : 'var(--acid)');
      grid.appendChild(tile);
    }
  }

  target.appendChild(grid);
  return target;
};

document.querySelectorAll('.shot, .portrait-wrap, .instagram-grid a').forEach(initializeCheckerReveal);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const reveal = () => entry.target.classList.add('visible');
      const image = entry.target.matches('.checker-reveal') ? entry.target.querySelector('img') : null;

      if (image && !image.complete) {
        image.addEventListener('load', reveal, { once: true });
        image.addEventListener('error', reveal, { once: true });
      } else {
        reveal();
      }

      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal, .checker-reveal').forEach((item) => observer.observe(item));

const addInstagramHoverIcon = (link) => {
  if (link.querySelector('.instagram-hover-icon')) return;
  const icon = document.createElement('span');
  icon.className = 'instagram-hover-icon material-symbols-outlined';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = 'arrow_outward';
  link.appendChild(icon);
};

document.querySelectorAll('.instagram-grid a').forEach(addInstagramHoverIcon);

const instagramFeed = document.querySelector('[data-instagram-feed]');
const instagramStatus = document.querySelector('[data-instagram-status]');
if (instagramFeed) {
  fetch('/api/instagram-feed', { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error('Instagram feed unavailable');
      return response.json();
    })
    .then(({ images }) => {
      if (!Array.isArray(images) || images.length === 0) throw new Error('Instagram feed empty');

      const fragment = document.createDocumentFragment();
      images.slice(0, 12).forEach((item, index) => {
        const link = document.createElement('a');
        link.href = 'https://www.instagram.com/thebalddude.dng/';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `Open @thebalddude.dng on Instagram — recent post ${index + 1}`);

        const image = document.createElement('img');
        image.src = item.url;
        image.alt = `Recent Instagram post from @thebalddude.dng, item ${index + 1}`;
        image.loading = 'lazy';
        image.decoding = 'async';
        link.appendChild(image);
        addInstagramHoverIcon(link);
        initializeCheckerReveal(link);
        fragment.appendChild(link);
      });

      instagramFeed.replaceChildren(fragment);
      instagramFeed.querySelectorAll('.checker-reveal').forEach((item) => observer.observe(item));
      if (instagramStatus) instagramStatus.textContent = 'Live from Instagram';
    })
    .catch(() => {
      instagramFeed.closest('.instagram-feed')?.classList.add('is-fallback');
      if (instagramStatus) instagramStatus.textContent = 'Feed temporarily unavailable';
      const message = document.createElement('p');
      message.className = 'instagram-feed-message';
      message.append('Instagram could not refresh this moment. ');
      const profileLink = document.createElement('a');
      profileLink.href = 'https://www.instagram.com/thebalddude.dng/';
      profileLink.target = '_blank';
      profileLink.rel = 'noopener noreferrer';
      profileLink.textContent = 'View the live profile';
      message.appendChild(profileLink);
      instagramFeed.replaceChildren(message);
    });
}

const clock = document.querySelector('.clock');
if (clock) {
  const updateClock = () => {
    const time = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date());
    clock.textContent = `NEW YORK / ${time}`;
  };
  updateClock();
  window.setInterval(updateClock, 1000);
}

const hero = document.querySelector('.hero');
const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
const heroSequence = document.querySelector('.hero-sequence span');
if (hero && heroSlides.length > 1 && !reducedMotion) {
  let activeIndex = 0;
  let timer;

  const activateSlide = (nextIndex) => {
    const current = heroSlides[activeIndex];
    const next = heroSlides[nextIndex];

    if (current instanceof HTMLVideoElement) {
      current.pause();
      current.currentTime = 0;
    }

    current.classList.remove('is-active');
    next.classList.add('is-active');
    activeIndex = nextIndex;

    if (heroSequence) {
      heroSequence.textContent = String(activeIndex + 1).padStart(2, '0');
    }

    hero.classList.remove('is-switching');
    void hero.offsetWidth;
    hero.classList.add('is-switching');

    if (next instanceof HTMLVideoElement) {
      next.currentTime = 0;
      next.play().catch(() => {});
    }

    const duration = Number(next.dataset.duration) || 1100;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      activateSlide((activeIndex + 1) % heroSlides.length);
    }, duration);
  };

  timer = window.setTimeout(() => activateSlide(1), Number(heroSlides[0].dataset.duration) || 1100);
}

const contactDialog = document.querySelector('.contact-dialog');
const contactForm = document.querySelector('.contact-form');
const contactStatus = document.querySelector('.contact-form-status');
const contactServiceField = document.querySelector('[data-service-field]');
const contactPriceField = document.querySelector('[data-price-field]');
const contactProjectType = document.querySelector('[data-project-type]');
const contactBudgetSelect = document.querySelector('[data-budget-select]');
const contactKicker = document.querySelector('[data-contact-kicker]');
const contactTitle = document.querySelector('[data-contact-title]');
const contactPrice = document.querySelector('[data-contact-price]');
const contactCopy = document.querySelector('[data-contact-copy]');

const contactCards = {
  'Fashion + Editorial': {
    kicker: 'Campaigns / lookbooks / street stories',
    title: 'Make it<br />editorial.',
    price: 'Starting range / $950–$3,200+',
    fieldPrice: '$950–$3,200+',
    budgets: ['$950–$1,500', '$1,500–$2,500', '$2,500–$3,200', '$3,200–$5,000', '$5,000+'],
    copy: 'Tell me about the collection, talent, locations, deliverables, and where the photographs will live. I’ll shape the right level of production around the story.'
  },
  'Events + Backstage': {
    kicker: 'Fashion week / red carpet / after dark',
    title: 'Put me<br />in the room.',
    price: 'Starting range / $1,250–$3,750+',
    fieldPrice: '$1,250–$3,750+',
    budgets: ['$1,250–$2,000', '$2,000–$3,000', '$3,000–$3,750', '$3,750–$5,000', '$5,000+'],
    copy: 'Share the date, venue, run of show, access, guest count, and turnaround needs. Coverage can include arrivals, backstage, atmosphere, portraits, details, and fast social selects.'
  },
  Portraits: {
    kicker: 'Artists / founders / people with presence',
    title: 'Step into<br />the frame.',
    price: 'Starting range / $650–$1,350',
    fieldPrice: '$650–$1,350',
    budgets: ['$650–$1,000', '$1,000–$1,350', '$1,350–$2,000', '$2,000+'],
    copy: 'Tell me who the photographs are for, how you want to be seen, and where the images will be used. We’ll build the location, styling, and direction around your point of view.'
  },
  Weddings: {
    kicker: 'Courthouse / intimate / beautifully unforced',
    title: 'Let it feel<br />like yours.',
    price: 'Starting range / $1,250–$2,750+',
    fieldPrice: '$1,250–$2,750+',
    budgets: ['$1,250–$1,750', '$1,750–$2,250', '$2,250–$2,750', '$2,750–$4,000', '$4,000+'],
    copy: 'Share your date, ceremony location, guest count, timeline, and the moments that matter most. Expect candid storytelling, decisive flash, and portraits with real editorial presence.'
  },
  Commercial: {
    kicker: 'Product / brand / social campaigns',
    title: 'Build the<br />campaign.',
    price: 'Creative fees / $1,500–$5,000+',
    fieldPrice: '$1,500–$5,000+ creative fee',
    budgets: ['$1,500–$2,500', '$2,500–$3,750', '$3,750–$5,000', '$5,000–$7,500', '$7,500+'],
    copy: 'Tell me about the brand, campaign, deliverables, usage, timeline, and production needs. Licensing, studio, talent, crew, styling, equipment, and travel are quoted to scope.'
  },
  default: {
    kicker: 'New work / New York + worldwide',
    title: 'Tell me what<br />we’re making.',
    price: 'Custom commissions / quoted to scope',
    fieldPrice: 'Custom quote',
    budgets: ['Under $1,000', '$1,000–$2,500', '$2,500–$5,000', '$5,000+'],
    copy: 'Give me the shape of the project. I’ll reply directly with availability, questions, and the clearest next step.'
  }
};

const enhancedSelects = [];

const enhanceSelect = (select, index) => {
  const wrapper = document.createElement('div');
  const trigger = document.createElement('button');
  const triggerText = document.createElement('span');
  const menu = document.createElement('div');
  const menuId = `contact-select-menu-${index + 1}`;
  let options = Array.from(select.options);
  let optionButtons = [];
  let activeIndex = Math.max(select.selectedIndex, 0);

  wrapper.className = 'custom-select is-enhanced';
  trigger.className = 'custom-select-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', menuId);
  menu.className = 'custom-select-menu';
  menu.id = menuId;
  menu.hidden = true;
  menu.setAttribute('role', 'listbox');

  select.parentNode.insertBefore(wrapper, select);
  wrapper.append(select, trigger, menu);
  trigger.appendChild(triggerText);

  const syncFromNative = () => {
    const selectedIndex = Math.max(select.selectedIndex, 0);
    activeIndex = selectedIndex;
    triggerText.textContent = options[selectedIndex]?.textContent || 'Choose one';
    optionButtons.forEach((button, optionIndex) => {
      button.setAttribute('aria-selected', optionIndex === selectedIndex ? 'true' : 'false');
    });
  };

  const setActive = (nextIndex, focus = true) => {
    activeIndex = Math.min(Math.max(nextIndex, 0), optionButtons.length - 1);
    optionButtons.forEach((button, optionIndex) => button.classList.toggle('is-active', optionIndex === activeIndex));
    if (focus) {
      optionButtons[activeIndex]?.focus();
      optionButtons[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  };

  const close = (restoreFocus = false) => {
    wrapper.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    optionButtons.forEach((button) => button.classList.remove('is-active'));
    if (restoreFocus) trigger.focus();
  };

  const open = (preferredIndex = select.selectedIndex) => {
    enhancedSelects.forEach((item) => {
      if (item.wrapper !== wrapper) item.close();
    });
    wrapper.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    setActive(Math.max(preferredIndex, 0));
  };

  function selectOption(optionIndex) {
    select.selectedIndex = optionIndex;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    close(true);
  }

  const renderOptions = () => {
    options = Array.from(select.options);
    menu.replaceChildren();
    optionButtons = options.map((option, optionIndex) => {
      const button = document.createElement('button');
      button.className = 'custom-select-option';
      button.type = 'button';
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', option.selected ? 'true' : 'false');
      button.tabIndex = -1;
      button.textContent = option.textContent;
      button.addEventListener('click', () => selectOption(optionIndex));
      menu.appendChild(button);
      return button;
    });
    syncFromNative();
  };

  const setOptions = (labels) => {
    select.replaceChildren();
    ['Choose a range', ...labels, 'Not sure yet'].forEach((label, optionIndex) => {
      const option = document.createElement('option');
      option.value = optionIndex === 0 ? '' : label;
      option.textContent = label;
      option.selected = optionIndex === 0;
      select.appendChild(option);
    });
    renderOptions();
  };

  trigger.addEventListener('click', () => {
    if (wrapper.classList.contains('is-open')) close();
    else open();
  });

  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open(event.key === 'ArrowDown' ? Math.max(select.selectedIndex, 0) : optionButtons.length - 1);
    }
  });

  menu.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActive(event.key === 'Home' ? 0 : optionButtons.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(activeIndex);
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      close(event.key === 'Escape');
    }
  });

  select.addEventListener('change', syncFromNative);
  select.addEventListener('invalid', (event) => {
    event.preventDefault();
    open();
  });
  renderOptions();
  enhancedSelects.push({ select, wrapper, close, syncFromNative, setOptions });
};

document.querySelectorAll('.contact-form select').forEach(enhanceSelect);
document.addEventListener('click', (event) => {
  enhancedSelects.forEach((item) => {
    if (!item.wrapper.contains(event.target)) item.close();
  });
});

if (contactDialog && contactForm) {
  document.querySelectorAll('[data-contact-form]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const service = trigger.dataset.service || '';
      const card = contactCards[service] || contactCards.default;

      if (contactServiceField) contactServiceField.value = service || 'General inquiry';
      if (contactPriceField) contactPriceField.value = card.fieldPrice;
      if (contactKicker) contactKicker.textContent = card.kicker;
      if (contactTitle) contactTitle.innerHTML = card.title;
      if (contactPrice) contactPrice.textContent = card.price;
      if (contactCopy) contactCopy.textContent = card.copy;
      const budgetControl = enhancedSelects.find((item) => item.select === contactBudgetSelect);
      budgetControl?.setOptions(card.budgets);
      if (contactProjectType) {
        contactProjectType.value = service;
        contactProjectType.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (contactStatus) {
        contactStatus.textContent = '';
        contactStatus.classList.remove('is-error');
      }

      contactDialog.showModal();
      document.body.classList.add('dialog-open');
      window.setTimeout(() => contactForm.querySelector('input:not([type="hidden"])')?.focus(), 0);
    });
  });

  const closeContactDialog = () => {
    contactDialog.close();
    document.body.classList.remove('dialog-open');
  };

  contactDialog.querySelector('.contact-dialog-close')?.addEventListener('click', closeContactDialog);
  contactDialog.addEventListener('click', (event) => {
    if (event.target === contactDialog) closeContactDialog();
  });
  contactDialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());

    submitButton.disabled = true;
    if (contactStatus) {
      contactStatus.textContent = 'Sending your inquiry…';
      contactStatus.classList.remove('is-error');
    }

    try {
      const response = await fetch('https://formsubmit.co/ajax/info@thebalddude.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || result.success === false) throw new Error('Submission failed');

      contactForm.reset();
      if (contactServiceField) contactServiceField.value = 'General inquiry';
      if (contactPriceField) contactPriceField.value = contactCards.default.fieldPrice;
      const budgetControl = enhancedSelects.find((item) => item.select === contactBudgetSelect);
      budgetControl?.setOptions(contactCards.default.budgets);
      window.requestAnimationFrame(() => enhancedSelects.forEach((item) => item.syncFromNative()));
      if (contactStatus) contactStatus.textContent = 'Inquiry sent. Justin will reply directly.';
    } catch (error) {
      if (contactStatus) {
        contactStatus.textContent = 'That did not send. Email info@thebalddude.co directly and I’ll get back to you.';
        contactStatus.classList.add('is-error');
      }
    } finally {
      submitButton.disabled = false;
    }
  });
}
