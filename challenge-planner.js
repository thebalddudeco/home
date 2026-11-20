(() => {
  const options = [...document.querySelectorAll('.challenge-section input[name="challenge"]')];
  const panel = document.querySelector('#plan-panel');
  if (!options.length || !panel) return;

  const plans = {
    fresh: 'Plan a fresh image library around your upcoming products, campaigns, and launches.',
    cohesion: 'Set a clear visual direction, then carry it across your product, campaign, and event imagery.',
    planning: 'Start with the brief: define the goal, audience, creative direction, and images the project needs.',
    activation: 'Build a coverage plan around the product, people, atmosphere, and interactions at your activation.',
    brand: 'Shape a commissioned project around the product, people, and point of view that make your brand distinct.'
  };
  const labels = new Map(options.map(input => [input.value, input.closest('label').querySelector('strong').textContent]));
  const panelTitle = document.querySelector('#plan-title');
  const panelCopy = document.querySelector('#plan-copy');
  const panelLink = document.querySelector('#recommended-relationship-link');
  const selected = () => options.filter(input => input.checked).map(input => input.value);

  function updatePlan() {
    const values = selected();
    if (!values.length) {
      panel.hidden = true;
      return;
    }
    const projectFocused = values.some(value => ['planning', 'activation', 'brand'].includes(value));
    panelTitle.textContent = projectFocused ? 'Start with a focused project.' : 'Build a consistent image library.';
    panelCopy.textContent = values.map(value => plans[value]).join(' ');
    const selectionSummary = values.map(value => '- ' + labels.get(value)).join('\n');
    const planSummary = values.map(value => plans[value]).join(' ');
    const emailBody = `What I selected:\n${selectionSummary}\n\nA possible starting point:\n${planSummary}`;
    panelLink.href = 'mailto:info@thebalddude.co?subject=' + encodeURIComponent(projectFocused ? 'Focused brand project' : 'Ongoing brand partnership') + '&body=' + encodeURIComponent(emailBody);
    panelLink.textContent = projectFocused ? 'Email about a focused project ↓' : 'Email about an ongoing partnership ↓';
    panel.hidden = false;
  }

  options.forEach(input => input.addEventListener('change', updatePlan));
})();
