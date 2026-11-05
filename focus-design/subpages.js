'use strict';
const menu = document.querySelector('#menu');
const toggle = document.querySelector('.menu-toggle');
function closeMenu() {
  menu.close();
  document.body.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.querySelector('span').textContent = 'MENU';
}
toggle.addEventListener('click', () => {
  if (menu.open) return closeMenu();
  menu.showModal();
  document.body.classList.add('menu-open');
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Close menu');
  toggle.querySelector('span').textContent = 'CLOSE';
});
document.querySelector('.dialog-close').addEventListener('click', () => {closeMenu();toggle.focus();});
menu.addEventListener('cancel', event => {event.preventDefault();closeMenu();toggle.focus();});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.querySelector('[data-year]').textContent = new Date().getFullYear();
