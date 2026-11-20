'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const asset = name => `/assets/${name.split('/').map(encodeURIComponent).join('/')}`;
const pad = n => String(n).padStart(2, '0');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const allowlistedProjectIds = new Set(['sony-focus-show']);
selectedProjectSets.push(
  {id:'sigma-spring-street', name:'Sigma × Spring Street', frames:[
    {image:'brand-work/sigma/dscf0337.webp'}, {image:'brand-work/sigma/dscf0343.webp'}, {image:'brand-work/sigma/dscf0382.webp'}, {image:'brand-work/sigma/dscf0422.webp'}, {image:'brand-work/sigma/dscf0443.webp'}, {image:'brand-work/sigma/dscf0475.webp'}
  ]},
  {id:'arabica-coffee-fest', name:'Arabica Coffee Fest', frames:[
    {image:'brand-work/arabica/arabica-01.webp'}, {image:'brand-work/arabica/arabica-02.webp'}, {image:'brand-work/arabica/arabica-03.webp'}, {image:'brand-work/arabica/arabica-04.webp'}, {image:'brand-work/arabica/arabica-05.webp'}, {image:'brand-work/arabica/arabica-06.webp'}
  ]}
);
allowlistedProjectIds.add('sigma-spring-street');
allowlistedProjectIds.add('arabica-coffee-fest');
const collections = [
 {id:'activations', name:'Brand Activations', frames:['brand-work/sigma/dscf0337.webp','sony-focus-show/sony-focus-cover-dscf0745.webp','brand-work/sigma/dscf0343.webp','sony-focus-show/DSCF0798.webp','brand-work/sigma/dscf0382.webp','sony-focus-show/DSCF0809.webp']},
 {id:'experiences', name:'Brand Experiences', frames:['brand-work/arabica/arabica-01.webp','brand-work/arabica/arabica-02.webp','brand-work/arabica/arabica-03.webp','brand-work/arabica/arabica-04.webp','brand-work/arabica/arabica-05.webp','brand-work/arabica/arabica-06.webp']},
 {id:'brand-films', name:'Brand Films', frames:['brand-work/arabica/arabica-film-poster.webp','brand-work/sigma/sigma-film-poster.webp'], videos:['brand-work/arabica/arabica-coffee-fest.webm','brand-work/sigma/sigma-event-film.webm']}
];
// The Bald Dude portfolio is intentionally brand focused. The After Hours
// archive remains the home for general event, fashion, and wedding coverage.
// Compare photo identity rather than filenames; retain one version per category.
const stillPhotoOwners = new Map();
collections.forEach(collection => {
  if (collection.videos) return;
  const seen = new Set();
  const retainedIndexes = [];
  collection.frames = collection.frames.filter((photo, index) => {
    if (excludedPhotoAssets.has(photo)) return false;
    const identity = canonicalPhotoAssets[photo] || photo;
    if (seen.has(identity) || stillPhotoOwners.has(identity)) return false;
    seen.add(identity); stillPhotoOwners.set(identity, collection.id); retainedIndexes.push(index); return true;
  });
  if (collection.videos) collection.videos = retainedIndexes.map(index => collection.videos[index]);
  if (collection.titles) collection.titles = retainedIndexes.map(index => collection.titles[index]);
});
const categoryCount = collections.length;
// New project galleries contain only their five selected photographs.
selectedProjectSets.filter(set => allowlistedProjectIds.has(set.id)).forEach(set => {
  const existing = collections.find(collection => collection.id === set.id);
  if (existing) {
    set.frames.filter(item => item.appendToGallery).forEach(item => existing.frames.push(item.image));
  } else {
    collections.push({id:set.id, name:set.name, frames:set.frames.map(item => item.image)});
  }
});
let category = 0, frame = 0, detailed = false;
const viewer = $('.viewer');
const frameMarkup = '<div class="selection-frame" aria-hidden="true">' + '<i></i>'.repeat(9) + '</div>';
// Keep the actual homepage rangefinder DOM intact; restyle its frame for the new canvas.
const rangefinderMarkup = "<div class=\"rf-ink\"><span class=\"rf-corner rf-corner-tl\"></span><span class=\"rf-corner rf-corner-tr\"></span><span class=\"rf-corner rf-corner-bl\"></span><span class=\"rf-corner rf-corner-br\"></span><span class=\"rf-aperture\">F5.6</span><span class=\"rf-scale\" aria-label=\"Scroll progress\"><b>3</b><b>2</b><b>1</b><b>0</b><b>1</b><b>2</b><b>3</b><i class=\"rf-pointer\"></i><span class=\"rf-dots\"><i class=\"rf-dot\"></i><i class=\"rf-dot\"></i><i class=\"rf-dot\"></i><i class=\"rf-dot\"></i><i class=\"rf-dot\"></i><i class=\"rf-dot\"></i><i class=\"rf-dot\"></i><i class=\"rf-dot\"></i><i class=\"rf-dot\"></i><i class=\"rf-dot\"></i><i class=\"rf-dot\"></i><i class=\"rf-dot\"></i><i class=\"rf-dot\"></i></span></span><span class=\"rf-exposure\">0.4 EV</span></div>";
$('.rangefinder').innerHTML = rangefinderMarkup;
for (let i = 0; i < 35; i++) {
  const dot = document.createElement('i'); dot.className = `focus-point${i === 17 ? ' active' : ''}`; $('.viewfinder-grid').append(dot);
}
collections.slice(0, categoryCount).forEach((collection, i) => {
  const categoryButton = document.createElement('button'); categoryButton.textContent = collection.name;
  const count = document.createElement('sup'); count.textContent = collection.frames.length; categoryButton.append(count);
  categoryButton.addEventListener('click', () => openCollection(i)); $('.category-nav').append(categoryButton);
  const ruler = document.createElement('button'); ruler.innerHTML = `${pad(i + 1)}<span>${collection.name}</span>`;
  ruler.setAttribute('aria-label', `View ${collection.name}`); ruler.addEventListener('click', () => openCollection(i, detailed)); $('.film-ruler').append(ruler);
});
collections.slice(categoryCount).forEach((collection, i) => {
  const index = categoryCount + i;
  const card = document.createElement('button'); card.className = 'collection';
  card.innerHTML = `<div class="collection-photo"><img src="${asset(collection.frames[0])}" alt="${collection.name}" loading="lazy">${frameMarkup}</div><h2>${collection.name}<span>${pad(collection.frames.length)} FRAMES</span></h2>`;
  card.addEventListener('click', () => openCollection(index)); $('.collection-track').append(card);
});
function updateScale(progress) {
  const scale = $('.rf-scale'); if (!scale) return;
  const index = Math.round(progress * 12);
  $('.rf-pointer').style.left = `${10.5 + (index / 12) * Math.max(0, scale.clientWidth - 21)}px`;
  $$('.rf-scale b').forEach((number, i) => number.classList.toggle('is-crossed', index === i * 2));
}
let railCategory = -1;
function renderFrame() {
  const collection = collections[category];
  frame = (frame + collection.frames.length) % collection.frames.length;
  const file = collection.frames[frame];
  $('#featured-video').pause();
  $('#featured-video').removeAttribute('src');
  $('#featured-video').hidden = true; $('#featured').hidden = false;
  $('#featured').src = asset(file); $('#featured').alt = `${collection.name} — ${file.replace(/\.(jpg|png)$/, '').replaceAll('-', ' ')}`;
  $('#backdrop').src = asset(file);
  $('.viewer-title h1').textContent = collection.name;
  $('#current').textContent = pad(frame + 1); $('#total').textContent = pad(collection.frames.length);
  const caption = collection.titles?.[frame] || file.replace(/(-poster)?\.(jpg|jpeg|png|webp)$/, '').replaceAll('-', ' ');
  $('#caption').textContent = `${caption.toUpperCase()} / NEW YORK`;
  $('.main-photo').setAttribute('aria-label', `${collection.name} photograph`);
  $$('.category-nav button').forEach((b, i) => b.setAttribute('aria-current', i === category ? 'true' : 'false'));
  $$('.film-ruler button').forEach((b, i) => b.setAttribute('aria-current', i === category ? 'true' : 'false'));
  const rail = $('.thumbnail-rail');
  if (railCategory !== category) {
  railCategory = category; rail.replaceChildren();
  collection.frames.forEach((photo, i) => {
    const button = document.createElement('button'); button.className = 'thumbnail'; button.setAttribute('aria-label', `View ${collection.name} photograph ${i + 1}`);
    button.setAttribute('aria-current', i === frame ? 'true' : 'false');
    const image = new Image(); image.src = asset(photo); image.alt = ''; image.loading = 'lazy'; button.append(image);
    button.addEventListener('click', () => {frame = i; renderFrame();}); rail.append(button);
  });
  }
  $$('.thumbnail', rail).forEach((b,i) => b.setAttribute('aria-current', i === frame ? 'true' : 'false'));
  if (detailed) $('.thumbnail[aria-current=true]', rail)?.scrollIntoView({block:'nearest',inline:'nearest'});
  if (collection.videos?.[frame] && detailed) {
    $('#featured').hidden = true; $('#featured-video').hidden = false;
    $('#featured-video').src = asset(collection.videos[frame]);
    $('#featured-video').poster = asset(file);
    $('#featured-video').setAttribute('aria-label', caption);
  }
  updateScale(collection.frames.length > 1 ? frame / (collection.frames.length - 1) : 0);
}
function setDetail(value) {
  detailed = value; viewer.classList.toggle('detail', value); $('.thumbnail-rail').hidden = !value;
  $('.layout-toggle').innerHTML = value ? '<span class="layout-icon">□</span> IMMERSIVE VIEW' : '<span class="layout-icon">▦</span> GALLERY VIEW';
  $('.layout-toggle').setAttribute('aria-label', value ? 'Switch to immersive view' : 'Switch to gallery view');
  renderFrame();
}
function openCollection(index, detail = true) {
  category = index; frame = 0;
  setDetail(detail);
  if (location.hash !== '#gallery') location.hash = '#gallery';
}
$('.step-prev').addEventListener('click', () => {frame--; renderFrame();});
$('.step-next').addEventListener('click', () => {frame++; renderFrame();});
$('.layout-toggle').addEventListener('click', () => setDetail(!detailed));
$('.main-photo').addEventListener('click', event => {if (!detailed && event.target.tagName !== 'VIDEO') setDetail(true);});
$('.open-gallery').addEventListener('click', () => setDetail(true));

// Scroll directly over the central image to advance the selected gallery.
let galleryWheelTotal = 0, galleryWheelTime = 0, galleryAdvanceTime = 0;
function advanceGallery(direction) {
  frame += direction;
  renderFrame();
  if (!reducedMotion.matches && !collections[category].videos?.[frame]) {
    $('#featured').animate([
      {opacity:0.5, transform:`translateY(${direction * 12}px)`},
      {opacity:1, transform:'translateY(0)'}
    ], {duration:180, easing:'ease-out'});
  }
}
$('.image-stage').addEventListener('wheel', event => {
  if (viewer.hidden || !detailed || event.ctrlKey) return;
  event.preventDefault();
  const now = performance.now();
  if (now - galleryWheelTime > 180) galleryWheelTotal = 0;
  galleryWheelTime = now;
  if (now - galleryAdvanceTime < 350) {galleryWheelTotal = 0; return;}
  galleryWheelTotal += (event.deltaY || event.deltaX) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewer.clientHeight : 1);
  if (Math.abs(galleryWheelTotal) >= 40) {
    advanceGallery(Math.sign(galleryWheelTotal));
    galleryAdvanceTime = now;
    galleryWheelTotal = 0;
  }
}, {passive:false});
let photoSwipe = null;
$('.main-photo').tabIndex = 0;
$('.main-photo').addEventListener('pointerdown', event => {
  if (!detailed || event.target.tagName === 'VIDEO' || event.button !== 0) return;
  photoSwipe = {x:event.clientX, y:event.clientY};
  $('.main-photo').setPointerCapture(event.pointerId);
});
$('.main-photo').addEventListener('pointerup', event => {
  if (!photoSwipe) return;
  const dx = event.clientX - photoSwipe.x, dy = event.clientY - photoSwipe.y;
  photoSwipe = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 35) advanceGallery((Math.abs(dy) > Math.abs(dx) ? dy : dx) < 0 ? 1 : -1);
});
$('.main-photo').addEventListener('pointercancel', () => photoSwipe = null);
$('.main-photo').addEventListener('lostpointercapture', () => photoSwipe = null);

function route() {
  const hash = location.hash.slice(1) || 'home';
  const parts = hash.split('/');
  const valid = ['home','overview','gallery','contact'];
  const page = valid.includes(parts[0]) ? parts[0] : 'home';
  if (page === 'gallery' && parts[1]) {
    const found = collections.findIndex(c => c.id === parts[1]); if (found >= 0) category = found;
    frame = Number(parts[2]) || 0; setDetail(true);
  }
  const galleryOpen = page === 'gallery';
  ['home','overview','contact'].forEach(id => $(`#${id}`).hidden = galleryOpen);
  viewer.hidden = !galleryOpen;
  document.body.classList.toggle('content-page', !galleryOpen);
  document.body.classList.toggle('gallery-open', galleryOpen);
  if (page !== 'gallery') $('#featured-video').pause(); else renderFrame();
  if (galleryOpen || page === 'home') window.scrollTo(0,0);
  else $(`#${page}`).scrollIntoView({block:'start'});
}
document.addEventListener('keydown', event => {
  if (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
  if (['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key) && !viewer.hidden) {
    event.preventDefault();
    const direction = ['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1;
    frame += direction; renderFrame();
  }
});
window.addEventListener('hashchange', route);
window.addEventListener('resize', () => updateScale(frame / Math.max(collections[category].frames.length - 1, 1)));
window.addEventListener('scroll', () => document.body.classList.toggle('page-scrolled', window.scrollY > 50), {passive:true});
$('[data-year]').textContent = new Date().getFullYear();
renderFrame(); route();
