(() => {
  document.querySelectorAll('.work-shell, .kit-shell').forEach((scrollWindow) => {
    const rangefinder = scrollWindow.querySelector('.rangefinder');
    const pointer = rangefinder?.querySelector('.rf-pointer');
    const scale = rangefinder?.querySelector('.rf-scale');
    const numbers = [...(rangefinder?.querySelectorAll('.rf-scale b') || [])];
    if (!rangefinder || !pointer || !scale) return;
    const update = () => {
      const max = Math.max(scrollWindow.scrollHeight - scrollWindow.clientHeight, 0);
      const progress = max ? scrollWindow.scrollTop / max : 0;
      const count = 13;
      const index = Math.round(progress * (count - 1));
      const start = 10.5;
      /* The overlay lives inside the scrollable card, so counter-scroll it to
         keep the frame and camera marks locked to the card viewport. */
      rangefinder.style.transform = `translateY(${scrollWindow.scrollTop + window.scrollY}px)`;
      pointer.style.left = `${start + (index / (count - 1)) * Math.max(0, scale.clientWidth - start * 2)}px`;
      numbers.forEach((number, numberIndex) => number.style.opacity = index === numberIndex * 2 ? '0' : '1');
    };
    scrollWindow.addEventListener('scroll', update, {passive:true});
    window.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update);
    update();
  });
})();
