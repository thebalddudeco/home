(() => {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '../services.css?v=20260925-20';
  document.head.appendChild(style);
  const path = window.location.pathname;
  const root = '../../assets/';
  const sets = {
    'editorial-fashion': [['runway-floral.jpg','Runway cut'],['chrome-visor.jpg','Chrome vision'],['fashion4ukraine-petal-flash.jpg','Petal flash'],['leopard-crown.jpg','Crown control'],['magenta-feather.jpg','Magenta state']],
    events: [['hero-sony-focus-dscf0768.jpg','Focus / direct'],['sony-rooftop-motion-poster.jpg','Rooftop motion'],['fashion4ukraine-after-dark-poster.jpg','After dark'],['chrome-visor.jpg','Guest flash'],['runway-floral.jpg','Runway cut']],
    portraits: [['justin-von-braun-portrait.png','Artist portrait'],['hero-backstage-gaze.jpg','Backstage gaze'],['leopard-crown.jpg','Crown control'],['magenta-feather.jpg','Magenta state'],['hero-structured-black.jpg','Structured black']],
    weddings: [['wedding-joyce-alex-balcony.jpg','Balcony escape'],['wedding-joyce-alex-kiss.jpg','Close-up'],['wedding-joyce-alex-family.jpg','The people who came running'],['wedding-joyce-alex-sidewalk.jpg','City portrait'],['wedding-joyce-alex-couch.jpg','Between takes']],
    commercial: [['hero-model.jpg','Campaign frame'],['hero-structured-black.jpg','Structured black'],['hero-backstage-gaze.jpg','Backstage gaze'],['chrome-visor.jpg','Product energy'],['runway-white.jpg','White heat']]
  };
  const key = Object.keys(sets).find((name) => path.includes(`/services/${name}/`));
  const target = document.querySelector('.service-detail-grid');
  if (!key || !target) return;
  const section = document.createElement('section');
  section.className = 'service-carousel';
  section.setAttribute('aria-label', `${key} photography examples`);
  section.innerHTML = `<div class="service-carousel-head"><p class="service-kicker">Selected frames</p><span>Scroll to explore</span></div><div class="service-carousel-track">${sets[key].map(([src, caption], index) => `<figure><img src="${root}${src}" alt="${caption} / ${key} photography" loading="lazy"><figcaption><b>${String(index + 1).padStart(2, '0')}</b><span>${caption}</span></figcaption></figure>`).join('')}</div>`;
  target.before(section);
})();
