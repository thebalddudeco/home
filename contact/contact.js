(() => {
  const options = [...document.querySelectorAll('input[name="challenge"]')];
  const button = document.querySelector('#reveal-plan');
  const panel = document.querySelector('#plan-panel');
  const error = document.querySelector('#challenge-error');
  const challengeField = document.querySelector('#selected-challenges');
  const directionField = document.querySelector('#suggested-direction');
  const packageField = document.querySelector('#selected-package');
  const form = document.querySelector('.inquiry-form');
  const recipes = {
    fresh: 'If fresh images are the gap, a twice-yearly content partnership can create two planned refreshes across the year. Each one starts with a shot list based on what your business needs to share next.',
    cohesion: 'If your visuals feel disconnected, start by defining one visual direction and planning where the images need to work. A focused brand shoot can establish the base; two planned refreshes a year can keep it current.',
    planning: 'If you are unsure what to shoot, begin with pre-production. We’ll clarify the goal, audience, upcoming moments, and image needs, then turn those into a focused plan for a brand shoot or event.',
    event: 'If an event is the priority, a one-off event shoot can cover the people, details, and atmosphere you want remembered. We’ll plan around your event schedule and deliver the edited photographs in an online gallery.',
    brand: 'If your images aren’t showing what makes you different, a one-off brand shoot can focus on your people, process, and point of view—creating a clearer image library to use across your channels.'
  };
  const labels = new Map(options.map(option => [option.value, option.closest('label').querySelector('strong').textContent]));
  const selected = () => options.filter(option => option.checked).map(option => option.value);
  const choiceFor = values => values.includes('event') || values.includes('planning') || values.includes('brand') ? 'one-off' : 'bi-annual';
  const packageLabel = id => id === 'bi-annual' ? 'The Bi-Annual Content Partnership' : 'Brand, Event & Private Event Photography';
  function makePlan(values) {
    const direction = values.map(value => recipes[value]).join(' ');
    const offer = choiceFor(values);
    document.querySelector('#plan-title').textContent = `${packageLabel(offer)} could be a useful place to start.`;
    document.querySelector('#plan-copy').textContent = direction;
    const link = document.querySelector('#recommended-package-link');
    link.href = offer === 'bi-annual' ? '#package-bi-annual' : '#package-one-off';
    link.firstChild.textContent = `See ${offer === 'bi-annual' ? 'the content partnership' : 'the one-off photography offer'} `;
    panel.hidden = false;
    challengeField.value = values.map(value => labels.get(value)).join('; ');
    directionField.value = direction;
    packageField.value = packageLabel(offer);
  }
  button.addEventListener('click', () => {
    const values = selected();
    if (!values.length) { error.hidden = false; options[0].focus(); return; }
    error.hidden = true;
    makePlan(values);
    panel.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest'});
  });
  options.forEach(option => option.addEventListener('change', () => {
    error.hidden = true;
    if (!panel.hidden && selected().length) makePlan(selected());
    else if (!selected().length) panel.hidden = true;
  }));
  document.querySelectorAll('.package-cta').forEach(link => link.addEventListener('click', () => { packageField.value = packageLabel(link.dataset.offer); }));
  form.addEventListener('submit', () => { if (selected().length && !directionField.value) makePlan(selected()); });

  document.documentElement.classList.add('has-motion');
  const questionHeading = document.querySelector('#question-title');
  const questionWords = questionHeading.textContent.trim().split(/\s+/);
  questionHeading.setAttribute('aria-label', questionWords.join(' '));
  questionHeading.innerHTML = questionWords.map((word, index) => `<span data-question-word="${index}">${word}</span>`).join(' ');
  const questionWordNodes = [...questionHeading.querySelectorAll('[data-question-word]')];
  const revealNodes = [...document.querySelectorAll('[data-reveal]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    }), {threshold:.12, rootMargin:'0px 0px -6% 0px'});
    revealNodes.forEach(node => revealObserver.observe(node));
  } else revealNodes.forEach(node => node.classList.add('is-visible'));

  let frame = 0;
  function updateScrollEffects() {
    frame = 0;
    if (reducedMotion.matches) return;
    const rect = document.querySelector('.scroll-question').getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight * .5);
    const progress = Math.min(1, Math.max(0, (window.innerHeight * .76 - rect.top) / travel));
    const heading = document.querySelector('#question-title');
    heading.style.setProperty('--question-progress', progress.toFixed(3));
    const lit = Math.round(progress * questionWordNodes.length);
    questionWordNodes.forEach((word, index) => word.classList.toggle('is-lit', index < lit));
    document.querySelectorAll('.hero-photo').forEach((photo, index) => {
      const shift = Math.max(-28, Math.min(28, window.scrollY * (index % 2 ? -.02 : .03)));
      photo.style.setProperty('--scroll-shift', `${shift}px`);
    });
  }
  const scheduleScrollEffects = () => { if (!frame) frame = requestAnimationFrame(updateScrollEffects); };
  window.addEventListener('scroll', scheduleScrollEffects, {passive:true});
  window.addEventListener('resize', scheduleScrollEffects, {passive:true});
  window.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType === 'touch' || window.innerWidth < 800) return;
    const x = (event.clientX / window.innerWidth - .5) * 8;
    const y = (event.clientY / window.innerHeight - .5) * 8;
    document.querySelectorAll('.hero-photo').forEach((photo, index) => {
      const sign = index % 2 ? -1 : 1;
      photo.style.setProperty('--pointer-x', `${x * sign}px`);
      photo.style.setProperty('--pointer-y', `${y * sign}px`);
    });
  }, {passive:true});

  document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => {
    const track = document.getElementById(button.dataset.scroll);
    if (track) track.scrollBy({left: Number(button.dataset.direction) * track.clientWidth * .78, behavior: reducedMotion.matches ? 'auto' : 'smooth'});
  }));
  updateScrollEffects();
})();
