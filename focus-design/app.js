'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const asset = name => `/assets/${name.split('/').map(encodeURIComponent).join('/')}`;
const pad = n => String(n).padStart(2, '0');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// Interleave five selected photographs from each of the ten major projects.
const projects = Array.from({length:5}, (_, imageIndex) => selectedProjectSets.map(set => ({
  name:set.name,
  label:`${set.label} / ${imageIndex + 1} OF 5`,
  image:set.frames[imageIndex].image,
  href:`#gallery/${set.id}/${set.frames[imageIndex].galleryIndex}`
}))).flat().filter(project => !excludedPhotoAssets.has(project.image));
const stack = $('.polaroid-stack');
let order = projects.map((_, i) => i);
const cards = projects.map((project, i) => {
  const card = document.createElement('figure');
  card.className = 'polaroid'; card.dataset.project = i;
  const image = new Image(); image.src = asset(project.image); image.alt = project.name; image.draggable = false; image.decoding = 'async'; image.loading = i < 5 ? 'eager' : 'lazy'; image.style.objectFit = 'contain'; image.style.objectPosition = 'center';
  const caption = document.createElement('figcaption');
  const name = document.createElement('em'); name.textContent = project.name;
  const label = document.createElement('span'); label.textContent = project.label;
  caption.append(name, label); card.append(image, caption); stack.append(card); return card;
});
const poses = ['translate(0%, 0%) rotate(0deg)', 'translate(-5%, 1%) rotate(-7deg)', 'translate(5%, 1%) rotate(8deg)', 'translate(-4%, 0%) rotate(-12deg)', 'translate(4%, -1%) rotate(12deg)'];
let cycling = false;
let lastCycle = 0;
const poseAt = index => poses[Math.min(index, poses.length - 1)];
const syncReel = (movingId = null) => {
  order.forEach((id, position) => {
    cards[id].style.zIndex = cards.length - position;
    cards[id].hidden = position >= 5 && id !== movingId;
    if (position >= 5 && id !== movingId) cards[id].style.transform = poseAt(position);
    cards[id].setAttribute('aria-hidden', position ? 'true' : 'false');
  });
  const id = order[0]; const project = projects[id];
  $('#reel-current').textContent = pad(id + 1);
  $('#reel-total').textContent = pad(projects.length);
  $('.reel-open').href = project.href;
  $('.reel-open').setAttribute('aria-label', `Open project: ${project.name}`);
  $('.reel-status').textContent = `${id + 1} of ${projects.length}: ${project.name}`;
};
order.forEach((id, i) => cards[id].style.transform = poseAt(i));
syncReel();
const moveCard = async (card, to, duration) => {
  if (reducedMotion.matches) { card.style.transform = to; return; }
  const from = getComputedStyle(card).transform;
  const animation = card.animate([{transform:from}, {transform:to}], {duration, easing:'cubic-bezier(.22,.68,.22,1)', fill:'forwards'});
  try { await animation.finished; } finally {card.style.transform = to; animation.cancel();}
};
async function cycleStack(direction = 1) {
  if (cycling) return;
  cycling = true;
  const distance = direction > 0 ? 'translate(30%, -112%) rotate(14deg)' : 'translate(-30%, -112%) rotate(-14deg)';
  try {
    if (direction > 0) {
      const outgoing = order[0];
      // Clear the pile while still above it, then change the layer and return underneath.
      await moveCard(cards[outgoing], distance, 330);
      order.push(order.shift());
      syncReel(outgoing);
      await Promise.all(order.map((id, i) => i < 5 || id === outgoing ? moveCard(cards[id], poseAt(i), id === outgoing ? 470 : 430) : Promise.resolve()));
      syncReel();
    } else {
      const incoming = order[order.length - 1];
      // Lift the bottom card clear before bringing it in front of the other prints.
      cards[incoming].hidden = false;
      await moveCard(cards[incoming], distance, 360);
      order.unshift(order.pop());
      syncReel();
      await Promise.all(order.slice(0,5).map((id, i) => moveCard(cards[id], poseAt(i), 450)));
      syncReel();
    }
  } finally {cycling = false; lastCycle = performance.now();}
}
$('.reel-next').addEventListener('click', () => cycleStack(1));
$('.reel-prev').addEventListener('click', () => cycleStack(-1));
let wheelAmount = 0, lastWheel = 0;
stack.addEventListener('wheel', event => {
  if ($('#menu').open || event.ctrlKey) return;
  event.preventDefault();
  const now = performance.now();
  if (now - lastWheel > 180) wheelAmount = 0;
  lastWheel = now;
  if (cycling || now - lastCycle < 200) {wheelAmount = 0; return;}
  wheelAmount += (event.deltaY || event.deltaX) * (event.deltaMode === 1 ? 16 : 1);
  if (Math.abs(wheelAmount) > 45) {cycleStack(Math.sign(wheelAmount)); wheelAmount = 0;}
}, {passive:false});
let drag = null;
stack.addEventListener('pointerdown', event => {
  if (cycling || (event.pointerType === 'mouse' && event.button !== 0)) return;
  drag = {x:event.clientX, y:event.clientY, id:event.pointerId};
  stack.setPointerCapture(event.pointerId);
});
stack.addEventListener('pointerup', event => {
  if (!drag) return;
  const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
  drag = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 35) cycleStack((Math.abs(dy) > Math.abs(dx) ? dy : dx) < 0 ? 1 : -1);
  else if (!cycling) location.href = projects[order[0]].href;
});
stack.addEventListener('pointercancel', () => drag = null);
stack.addEventListener('lostpointercapture', () => drag = null);
const collections = [
 {id:'editorial', name:'Editorial', frames:['hero-sony-focus-dscf0768.jpg','runway-floral.jpg','chrome-visor.jpg','fashion4ukraine-petal-flash.jpg','leopard-crown.jpg','magenta-feather.jpg','runway-white.jpg','hero-structured-black.jpg']},
 {id:'portraits', name:'Portraits', frames:['portraits-sony-dscf0745.jpg','hero-model.jpg','magenta-feather.jpg','chrome-visor.jpg','leopard-crown.jpg']},
 {id:'events', name:'Events', frames:['fashion4ukraine-01.jpg','fashion4ukraine-02.jpg','fashion4ukraine-blue-hour.jpg','fashion4ukraine-03.jpg','fashion4ukraine-04.jpg','ruffle-afterdark.jpg']},
 {id:'weddings', name:'Weddings', frames:['wedding-joyce-alex-kiss.jpg','wedding-joyce-alex-balcony.jpg','wedding-joyce-alex-confetti.jpg','wedding-joyce-alex-couch.jpg','wedding-joyce-alex-carry.jpg','wedding-joyce-alex-sunglasses.jpg','wedding-joyce-alex-subway.jpg','wedding-joyce-alex-family.jpg']},
 {id:'motion', name:'Motion', frames:['fashion4ukraine-backstage-poster.jpg','sony-rooftop-motion-poster.jpg','fashion4ukraine-after-dark-poster.jpg','nyc-halloween-parade-reel-01-poster.jpg','nyc-halloween-parade-reel-02-poster.jpg'], videos:['fashion4ukraine-backstage.mp4','sony-rooftop-motion.mp4','fashion4ukraine-after-dark.mp4','nyc-halloween-parade-reel-01.mp4','nyc-halloween-parade-reel-02.mp4']}
];
// Additional films were checked against existing videos and alternate exports.
const motionCollection = collections.find(collection => collection.id === 'motion');
additionalMotionFilms.forEach(film => {
  const index = motionCollection.frames.length;
  motionCollection.frames.push(film.image);
  motionCollection.videos.push(film.video);

});
// Keep collection covers first; append only selects assigned to that category.
selectedCategoryFrames.forEach(item => {
  const collection = collections.find(entry => entry.id === item.category);
  if (collection && !collection.frames.includes(item.image)) collection.frames.push(item.image);
});
// Compare photo identity rather than filenames; retain one version per category.
collections.forEach(collection => {
  if (collection.videos) return;
  const seen = new Set();
  collection.frames = collection.frames.filter(photo => {
    if (excludedPhotoAssets.has(photo)) return false;
    const identity = canonicalPhotoAssets[photo] || photo;
    if (seen.has(identity)) return false;
    seen.add(identity); return true;
  });
});
const categoryCount = collections.length;
collections.push(...[{"id": "sony-focus-show", "name": "Sony \u00d7 Focus", "frames": ["sony-focus-show/DSCF0743.jpg", "sony-focus-show/DSCF0745.jpg", "sony-focus-show/DSCF0763.jpg", "sony-focus-show/DSCF0765.jpg", "sony-focus-show/DSCF0766.jpg", "sony-focus-show/DSCF0768.jpg", "sony-focus-show/DSCF0773.jpg", "sony-focus-show/DSCF0774.jpg", "sony-focus-show/DSCF0778.jpg", "sony-focus-show/DSCF0785.jpg", "sony-focus-show/DSCF0787.jpg", "sony-focus-show/DSCF0791.jpg", "sony-focus-show/DSCF0795.jpg", "sony-focus-show/DSCF0798.jpg", "sony-focus-show/DSCF0804.jpg", "sony-focus-show/DSCF0809.jpg", "sony-focus-show/DSCF0824.jpg", "sony-focus-show/DSCF0837.jpg", "sony-focus-show/DSCF0839.jpg", "sony-focus-show/DSCF0851.jpg", "sony-focus-show/DSCF0874.jpg", "sony-focus-show/DSCF0877.jpg", "sony-focus-show/DSCF0881.jpg", "sony-focus-show/DSCF0888.jpg", "sony-focus-show/DSCF0891.jpg", "sony-focus-show/DSCF0904.jpg", "sony-focus-show/DSCF0908.jpg", "sony-focus-show/DSCF0914.jpg", "sony-focus-show/DSCF0916.jpg", "sony-focus-show/DSCF0922.jpg", "sony-focus-show/DSCF0928.jpg", "sony-focus-show/DSCF0932.jpg", "sony-focus-show/DSCF0936.jpg", "sony-focus-show/DSCF0939.jpg", "sony-focus-show/DSCF0945.jpg", "sony-focus-show/DSCF0946.jpg", "sony-focus-show/DSCF0952.jpg", "sony-focus-show/DSCF0957.jpg", "sony-focus-show/DSCF0966.jpg", "sony-focus-show/DSCF0970.jpg", "sony-focus-show/DSCF0971.jpg", "sony-focus-show/DSCF0976.jpg", "sony-focus-show/DSCF0977.jpg", "sony-focus-show/DSCF0978.jpg", "sony-focus-show/DSCF0979.jpg", "sony-focus-show/DSCF0980.jpg", "sony-focus-show/DSCF0982.jpg", "sony-focus-show/DSCF0990.jpg", "sony-focus-show/DSCF0992.jpg", "sony-focus-show/DSCF0999.jpg", "sony-focus-show/DSCF1002.jpg", "sony-focus-show/DSCF1005.jpg", "sony-focus-show/DSCF1006.jpg", "sony-focus-show/DSCF1009.jpg", "sony-focus-show/DSCF1010.jpg", "sony-focus-show/DSCF1016.jpg", "sony-focus-show/DSCF1021.jpg", "sony-focus-show/DSCF1023.jpg", "sony-focus-show/DSCF1024.jpg", "sony-focus-show/DSCF1025.jpg", "sony-focus-show/DSCF1026.jpg", "sony-focus-show/DSCF1028.jpg", "sony-focus-show/DSCF1036.jpg", "sony-focus-show/DSCF1037.jpg", "sony-focus-show/DSCF1041.jpg", "sony-focus-show/DSCF1044.jpg", "sony-focus-show/DSCF1047.jpg", "sony-focus-show/DSCF1050.jpg", "sony-focus-show/DSCF1054.jpg", "sony-focus-show/DSCF1055.jpg", "sony-focus-show/DSCF1056.jpg", "sony-focus-show/DSCF1057.jpg", "sony-focus-show/DSCF1060.jpg", "sony-focus-show/DSCF1061.jpg", "sony-focus-show/DSCF1064.jpg", "sony-focus-show/DSCF1065.jpg", "sony-focus-show/DSCF1066.jpg", "sony-focus-show/DSCF1067.jpg", "sony-focus-show/DSCF1079.jpg", "sony-focus-show/DSCF1097.jpg", "sony-focus-show/DSCF1106.jpg", "sony-focus-show/DSCF1109.jpg", "sony-focus-show/DSCF1110.jpg", "sony-focus-show/DSCF1112.jpg", "sony-focus-show/DSCF1116.jpg", "sony-focus-show/DSCF1118.jpg"]}, {"id": "fashion4ukraine", "name": "Fashion4Ukraine", "frames": ["fashion4ukraine/DSCF0113.jpg", "fashion4ukraine/DSCF0115.jpg", "fashion4ukraine/DSCF0118.jpg", "fashion4ukraine/DSCF0159.jpg", "fashion4ukraine/DSCF0172.jpg", "fashion4ukraine/DSCF0185.jpg", "fashion4ukraine/DSCF0214.jpg", "fashion4ukraine/DSCF0215.jpg", "fashion4ukraine/DSCF0229.jpg", "fashion4ukraine/DSCF0232.jpg", "fashion4ukraine/DSCF0234.jpg", "fashion4ukraine/DSCF0237.jpg", "fashion4ukraine/DSCF0239.jpg", "fashion4ukraine/DSCF0240.jpg", "fashion4ukraine/DSCF0242.jpg", "fashion4ukraine/DSCF0243.jpg", "fashion4ukraine/DSCF0246.jpg", "fashion4ukraine/DSCF0248.jpg", "fashion4ukraine/DSCF0249.jpg", "fashion4ukraine/DSCF0254.jpg", "fashion4ukraine/DSCF0259.jpg", "fashion4ukraine/DSCF0375.jpg", "fashion4ukraine/DSCF0392.jpg", "fashion4ukraine/DSCF0394.jpg", "fashion4ukraine/DSCF0396.jpg", "fashion4ukraine/DSCF0398.jpg", "fashion4ukraine/DSCF0402.jpg", "fashion4ukraine/DSCF0404.jpg", "fashion4ukraine/DSCF0414.jpg", "fashion4ukraine/DSCF0416.jpg", "fashion4ukraine/DSCF0421.jpg", "fashion4ukraine/DSCF0423.jpg", "fashion4ukraine/DSCF0427.jpg", "fashion4ukraine/DSCF0459.jpg", "fashion4ukraine/DSCF0461.jpg", "fashion4ukraine/DSCF0464.jpg", "fashion4ukraine/DSCF0470.jpg", "fashion4ukraine/DSCF0471.jpg", "fashion4ukraine/DSCF0478.jpg", "fashion4ukraine/DSCF0482.jpg", "fashion4ukraine/DSCF0484.jpg", "fashion4ukraine/DSCF0485.jpg", "fashion4ukraine/DSCF0493.jpg", "fashion4ukraine/DSCF0496.jpg", "fashion4ukraine/DSCF0499.jpg", "fashion4ukraine/DSCF0504.jpg", "fashion4ukraine/DSCF0506.jpg", "fashion4ukraine/DSCF0509.jpg", "fashion4ukraine/DSCF0520.jpg", "fashion4ukraine/DSCF0524.jpg", "fashion4ukraine/DSCF0526.jpg", "fashion4ukraine/DSCF0543.jpg", "fashion4ukraine/DSCF0550.jpg", "fashion4ukraine/DSCF0554.jpg", "fashion4ukraine/DSCF0560.jpg", "fashion4ukraine/DSCF0564.jpg", "fashion4ukraine/DSCF0569.jpg", "fashion4ukraine/DSCF0573.jpg", "fashion4ukraine/DSCF0576.jpg", "fashion4ukraine/DSCF0581.jpg", "fashion4ukraine/DSCF0588.jpg", "fashion4ukraine/DSCF0591.jpg", "fashion4ukraine/DSCF0615.jpg", "fashion4ukraine/DSCF0620.jpg", "fashion4ukraine/DSCF0629.jpg", "fashion4ukraine/DSCF0631.jpg", "fashion4ukraine/DSCF0634.jpg", "fashion4ukraine/DSCF0642.jpg", "fashion4ukraine/DSCF0659.jpg", "fashion4ukraine/DSCF0663.jpg", "fashion4ukraine/DSCF0674.jpg", "fashion4ukraine/DSCF0699.jpg", "fashion4ukraine/DSCF0736.jpg", "fashion4ukraine/DSCF0739.jpg", "fashion4ukraine/DSCF0742.jpg", "fashion4ukraine/DSCF0747.jpg", "fashion4ukraine/DSCF0749.jpg", "fashion4ukraine/DSCF0752.jpg", "fashion4ukraine/DSCF0760.jpg", "fashion4ukraine/DSCF0762.jpg", "fashion4ukraine/DSCF0769.jpg", "fashion4ukraine/DSCF0770.jpg", "fashion4ukraine/DSCF0776.jpg", "fashion4ukraine/DSCF0779.jpg", "fashion4ukraine/DSCF0780.jpg", "fashion4ukraine/DSCF0784.jpg", "fashion4ukraine/DSCF0840.jpg", "fashion4ukraine/DSCF0843.jpg", "fashion4ukraine/DSCF0845.jpg", "fashion4ukraine/DSCF0846.jpg", "fashion4ukraine/DSCF0853.jpg", "fashion4ukraine/DSCF0857.jpg", "fashion4ukraine/DSCF1192.jpg", "fashion4ukraine/DSCF1194.jpg", "fashion4ukraine/DSCF1205.jpg", "fashion4ukraine/DSCF1250.jpg", "fashion4ukraine/DSCF1255.jpg", "fashion4ukraine/DSCF1257.jpg", "fashion4ukraine/DSCF1260.jpg", "fashion4ukraine/DSCF1275.jpg", "fashion4ukraine/DSCF1289.jpg", "fashion4ukraine/DSCF1297.jpg", "fashion4ukraine/DSCF1300.jpg", "fashion4ukraine/DSCF1376.jpg", "fashion4ukraine/DSCF1381.jpg", "fashion4ukraine/DSCF1384.jpg", "fashion4ukraine/DSCF1395.jpg", "fashion4ukraine/DSCF1411.jpg", "fashion4ukraine/DSCF1416.jpg", "fashion4ukraine/DSCF1446.jpg", "fashion4ukraine/DSCF1497.jpg", "fashion4ukraine/DSCF1500.jpg", "fashion4ukraine/DSCF1503.jpg", "fashion4ukraine/DSCF1504.jpg", "fashion4ukraine/DSCF1528.jpg", "fashion4ukraine/DSCF1532.jpg", "fashion4ukraine/DSCF1539.jpg", "fashion4ukraine/DSCF1541.jpg", "fashion4ukraine/DSCF1546.jpg", "fashion4ukraine/DSCF1555.jpg", "fashion4ukraine/DSCF1556.jpg", "fashion4ukraine/DSCF1559.jpg", "fashion4ukraine/DSCF1569.jpg", "fashion4ukraine/DSCF1580.jpg", "fashion4ukraine/DSCF1593.jpg", "fashion4ukraine/DSCF1603.jpg", "fashion4ukraine/DSCF1610.jpg", "fashion4ukraine/DSCF1718.jpg", "fashion4ukraine/DSCF1722.jpg", "fashion4ukraine/DSCF1729.jpg", "fashion4ukraine/DSCF1732.jpg", "fashion4ukraine/DSCF1747.jpg", "fashion4ukraine/DSCF1750.jpg", "fashion4ukraine/DSCF1754.jpg", "fashion4ukraine/DSCF1758.jpg", "fashion4ukraine/DSCF1771.jpg", "fashion4ukraine/DSCF1966.jpg", "fashion4ukraine/DSCF2057.jpg", "fashion4ukraine/DSCF2062.jpg", "fashion4ukraine/DSCF2072.jpg", "fashion4ukraine/DSCF2078.jpg", "fashion4ukraine/DSCF2085.jpg", "fashion4ukraine/DSCF2087.jpg", "fashion4ukraine/DSCF2090.jpg", "fashion4ukraine/DSCF2103.jpg", "fashion4ukraine/DSCF2105.jpg", "fashion4ukraine/DSCF2107.jpg", "fashion4ukraine/DSCF2119.jpg", "fashion4ukraine/DSCF2132.jpg", "fashion4ukraine/DSCF2139.jpg", "fashion4ukraine/DSCF2143.jpg", "fashion4ukraine/DSCF2150.jpg", "fashion4ukraine/DSCF2159.jpg", "fashion4ukraine/DSCF2162.jpg", "fashion4ukraine/DSCF2171.jpg", "fashion4ukraine/DSCF2175.jpg", "fashion4ukraine/DSCF2179.jpg", "fashion4ukraine/DSCF2181.jpg", "fashion4ukraine/DSCF2186.jpg", "fashion4ukraine/DSCF2195.jpg", "fashion4ukraine/DSCF2211.jpg", "fashion4ukraine/DSCF2213.jpg", "fashion4ukraine/DSCF2217.jpg", "fashion4ukraine/DSCF2221.jpg", "fashion4ukraine/DSCF2225.jpg", "fashion4ukraine/DSCF2245.jpg", "fashion4ukraine/DSCF2255.jpg", "fashion4ukraine/DSCF2265.jpg", "fashion4ukraine/DSCF2268.jpg", "fashion4ukraine/DSCF2286.jpg", "fashion4ukraine/DSCF2293.jpg", "fashion4ukraine/DSCF2326.jpg", "fashion4ukraine/DSCF2331.jpg", "fashion4ukraine/DSCF2340.jpg", "fashion4ukraine/DSCF2361.jpg", "fashion4ukraine/DSCF2385.jpg", "fashion4ukraine/DSCF2399.jpg", "fashion4ukraine/DSCF2410.jpg", "fashion4ukraine/DSCF2422.jpg", "fashion4ukraine/DSCF2461.jpg", "fashion4ukraine/DSCF2462.jpg"]}, {"id": "joyce-aleks", "name": "Joyce + Aleks", "frames": ["joyce-alex/DSCF0005.jpg", "joyce-alex/DSCF0009.jpg", "joyce-alex/DSCF0011.jpg", "joyce-alex/DSCF0015.jpg", "joyce-alex/DSCF0019.jpg", "joyce-alex/DSCF0021.jpg", "joyce-alex/DSCF0028.jpg", "joyce-alex/DSCF0034.jpg", "joyce-alex/DSCF0046.jpg", "joyce-alex/DSCF0059.jpg", "joyce-alex/DSCF0063.jpg", "joyce-alex/DSCF0066.jpg", "joyce-alex/DSCF0072.jpg", "joyce-alex/DSCF0076.jpg", "joyce-alex/DSCF0090.jpg", "joyce-alex/DSCF0094.jpg", "joyce-alex/DSCF0104.jpg", "joyce-alex/DSCF0111.jpg", "joyce-alex/DSCF0113.jpg", "joyce-alex/DSCF0126.jpg", "joyce-alex/DSCF0134.jpg", "joyce-alex/DSCF0141.jpg", "joyce-alex/DSCF0155.jpg", "joyce-alex/DSCF0182.jpg", "joyce-alex/DSCF0195.jpg", "joyce-alex/DSCF0224.jpg", "joyce-alex/DSCF0234.jpg", "joyce-alex/DSCF0259.jpg", "joyce-alex/DSCF0275.jpg", "joyce-alex/DSCF0314.jpg", "joyce-alex/DSCF0335.jpg", "joyce-alex/DSCF0392.jpg", "joyce-alex/DSCF0440.jpg", "joyce-alex/DSCF0463.jpg", "joyce-alex/DSCF0478.jpg", "joyce-alex/DSCF0490.jpg", "joyce-alex/DSCF0533.jpg", "joyce-alex/DSCF0588.jpg", "joyce-alex/DSCF0625.jpg"]}]);
// New project galleries contain only their five selected photographs.
selectedProjectSets.forEach(set => {
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
  const card = document.createElement('button'); card.className = 'collection'; card.innerHTML = `<div class="collection-photo"><img src="${asset(collection.frames[0])}" alt="${collection.name} collection" loading="lazy">${frameMarkup}</div><h2>${collection.name}<span>${pad(collection.frames.length)} FRAMES</span></h2>`;
  card.addEventListener('click', () => openCollection(i)); $('.collection-track').append(card);
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
  $('#featured-video').hidden = true; $('#featured').hidden = false;
  $('#featured').src = asset(file); $('#featured').alt = `${collection.name} — ${file.replace(/\.(jpg|png)$/, '').replaceAll('-', ' ')}`;
  $('#backdrop').src = asset(file);
  $('.viewer-title h1').textContent = collection.name;
  $('#current').textContent = pad(frame + 1); $('#total').textContent = pad(collection.frames.length);
  const caption = file.replace(/(-poster)?\.(jpg|png)$/, '').replaceAll('-', ' ');
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
  if (collection.videos && detailed) {
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
  if (!reducedMotion.matches && !collections[category].videos) {
    $('#featured').animate([
      {opacity:0.5, transform:`translateY(${direction * 12}px)`},
      {opacity:1, transform:'translateY(0)'}
    ], {duration:180, easing:'ease-out'});
  }
}
$('.image-stage').addEventListener('wheel', event => {
  if (viewer.hidden || !detailed || $('#menu').open || event.ctrlKey) return;
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

const menu = $('#menu'), menuToggle = $('.menu-toggle');
function closeMenu() {menu.close(); document.body.classList.remove('menu-open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Open menu'); menuToggle.querySelector('span').textContent = 'MENU';}
menuToggle.addEventListener('click', () => {
  if (menu.open) closeMenu();
  else {menu.showModal(); document.body.classList.add('menu-open'); menuToggle.setAttribute('aria-expanded', 'true'); menuToggle.setAttribute('aria-label', 'Close menu'); menuToggle.querySelector('span').textContent = 'CLOSE';}
});
menu.addEventListener('cancel', event => {event.preventDefault(); closeMenu(); menuToggle.focus();});
$$('a', menu).forEach(link => link.addEventListener('click', closeMenu));
$('.dialog-close').addEventListener('click', () => {closeMenu(); menuToggle.focus();});
function route() {
  const hash = location.hash.slice(1) || 'home';
  const parts = hash.split('/');
  const valid = ['home','intro','overview','motion','services','gallery','about','reviews','contact','main'];
  const page = valid.includes(parts[0]) ? parts[0] : 'home';
  if (page === 'gallery' && parts[1]) {
    const found = collections.findIndex(c => c.id === parts[1]); if (found >= 0) category = found;
    frame = Number(parts[2]) || 0; setDetail(true);
  }
  const galleryOpen = page === 'gallery';
  ['home','intro','overview','motion','services','about','reviews','contact'].forEach(id => $(`#${id}`).hidden = galleryOpen);
  viewer.hidden = !galleryOpen;
  document.body.classList.toggle('content-page', !galleryOpen);
  document.body.classList.toggle('gallery-open', galleryOpen);
  $('.overview-link').href = page === 'home' ? '#overview' : '#home';
  $('.overview-link').setAttribute('aria-label', page === 'home' ? 'View overview' : 'Back to projects');
  $('.overview-link span:last-child').textContent = page === 'home' ? 'OVERVIEW' : 'BACK TO PROJECTS';
  if (page !== 'gallery') $('#featured-video').pause(); else renderFrame();
  if (menu.open) closeMenu();
  if (galleryOpen || page === 'home' || page === 'main') window.scrollTo(0,0);
  else $(`#${page}`).scrollIntoView({block:'start'});
}
document.addEventListener('keydown', event => {
  if (menu.open || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
  const homeVisible = !$('#home').hidden && document.activeElement === stack;
  if (['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key) && (homeVisible || !viewer.hidden)) {
    event.preventDefault();
    const direction = ['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1;
    if (homeVisible) cycleStack(direction); else {frame += direction; renderFrame();}
  }
  if (event.key === 'Enter' && document.activeElement === stack && !cycling) location.href = projects[order[0]].href;
});
window.addEventListener('hashchange', route);
window.addEventListener('resize', () => updateScale(frame / Math.max(collections[category].frames.length - 1, 1)));
window.addEventListener('scroll', () => document.body.classList.toggle('page-scrolled', window.scrollY > 50), {passive:true});
$('[data-year]').textContent = new Date().getFullYear();
renderFrame(); route();
