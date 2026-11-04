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
  ratio:set.frames[imageIndex].width / set.frames[imageIndex].height,
  href:`#gallery/${set.id}/${set.frames[imageIndex].galleryIndex}`
}))).flat().filter(project => !excludedPhotoAssets.has(project.image));
const stack = $('.polaroid-stack');
let order = projects.map((_, i) => i);
const cards = projects.map((project, i) => {
  const card = document.createElement('figure');
  card.className = 'polaroid'; card.dataset.project = i;
  const image = new Image(); image.src = asset(project.image); image.alt = project.name; image.draggable = false; image.decoding = 'async'; image.loading = i < 5 ? 'eager' : 'lazy'; image.style.objectFit = 'cover'; image.style.objectPosition = '50% 20%';
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
 {id:'editorial', name:'Editorial', frames:['hero-sony-focus-dscf0768.webp','runway-floral.webp','chrome-visor.webp','fashion4ukraine-petal-flash.webp','leopard-crown.webp','magenta-feather.webp','runway-white.webp','hero-structured-black.webp']},
 {id:'portraits', name:'Portraits', frames:['portraits-sony-dscf0745.webp','hero-model.webp','magenta-feather.webp','chrome-visor.webp','leopard-crown.webp']},
 {id:'events', name:'Events', frames:['fashion4ukraine-01.webp','fashion4ukraine-02.webp','fashion4ukraine-blue-hour.webp','fashion4ukraine-03.webp','fashion4ukraine-04.webp','ruffle-afterdark.webp']},
 {id:'weddings', name:'Weddings', frames:['wedding-joyce-alex-kiss.webp','wedding-joyce-alex-balcony.webp','wedding-joyce-alex-confetti.webp','wedding-joyce-alex-couch.webp','wedding-joyce-alex-carry.webp','wedding-joyce-alex-sunglasses.webp','wedding-joyce-alex-subway.webp','wedding-joyce-alex-family.webp']},
 {id:'motion', name:'Motion', frames:['fashion4ukraine-backstage-poster.webp','sony-rooftop-motion-poster.webp','fashion4ukraine-after-dark-poster.webp','nyc-halloween-parade-reel-01-poster.webp','nyc-halloween-parade-reel-02-poster.webp'], videos:['fashion4ukraine-backstage.webm','sony-rooftop-motion.webm','fashion4ukraine-after-dark.webm','nyc-halloween-parade-reel-01.webm','nyc-halloween-parade-reel-02.webm']}
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
collections.push(...[{"id": "sony-focus-show", "name": "Sony \u00d7 Focus", "frames": ["sony-focus-show/DSCF0743.webp", "sony-focus-show/DSCF0745.webp", "sony-focus-show/DSCF0763.webp", "sony-focus-show/DSCF0765.webp", "sony-focus-show/DSCF0766.webp", "sony-focus-show/DSCF0768.webp", "sony-focus-show/DSCF0773.webp", "sony-focus-show/DSCF0774.webp", "sony-focus-show/DSCF0778.webp", "sony-focus-show/DSCF0785.webp", "sony-focus-show/DSCF0787.webp", "sony-focus-show/DSCF0791.webp", "sony-focus-show/DSCF0795.webp", "sony-focus-show/DSCF0798.webp", "sony-focus-show/DSCF0804.webp", "sony-focus-show/DSCF0809.webp", "sony-focus-show/DSCF0824.webp", "sony-focus-show/DSCF0837.webp", "sony-focus-show/DSCF0839.webp", "sony-focus-show/DSCF0851.webp", "sony-focus-show/DSCF0874.webp", "sony-focus-show/DSCF0877.webp", "sony-focus-show/DSCF0881.webp", "sony-focus-show/DSCF0888.webp", "sony-focus-show/DSCF0891.webp", "sony-focus-show/DSCF0904.webp", "sony-focus-show/DSCF0908.webp", "sony-focus-show/DSCF0914.webp", "sony-focus-show/DSCF0916.webp", "sony-focus-show/DSCF0922.webp", "sony-focus-show/DSCF0928.webp", "sony-focus-show/DSCF0932.webp", "sony-focus-show/DSCF0936.webp", "sony-focus-show/DSCF0939.webp", "sony-focus-show/DSCF0945.webp", "sony-focus-show/DSCF0946.webp", "sony-focus-show/DSCF0952.webp", "sony-focus-show/DSCF0957.webp", "sony-focus-show/DSCF0966.webp", "sony-focus-show/DSCF0970.webp", "sony-focus-show/DSCF0971.webp", "sony-focus-show/DSCF0976.webp", "sony-focus-show/DSCF0977.webp", "sony-focus-show/DSCF0978.webp", "sony-focus-show/DSCF0979.webp", "sony-focus-show/DSCF0980.webp", "sony-focus-show/DSCF0982.webp", "sony-focus-show/DSCF0990.webp", "sony-focus-show/DSCF0992.webp", "sony-focus-show/DSCF0999.webp", "sony-focus-show/DSCF1002.webp", "sony-focus-show/DSCF1005.webp", "sony-focus-show/DSCF1006.webp", "sony-focus-show/DSCF1009.webp", "sony-focus-show/DSCF1010.webp", "sony-focus-show/DSCF1016.webp", "sony-focus-show/DSCF1021.webp", "sony-focus-show/DSCF1023.webp", "sony-focus-show/DSCF1024.webp", "sony-focus-show/DSCF1025.webp", "sony-focus-show/DSCF1026.webp", "sony-focus-show/DSCF1028.webp", "sony-focus-show/DSCF1036.webp", "sony-focus-show/DSCF1037.webp", "sony-focus-show/DSCF1041.webp", "sony-focus-show/DSCF1044.webp", "sony-focus-show/DSCF1047.webp", "sony-focus-show/DSCF1050.webp", "sony-focus-show/DSCF1054.webp", "sony-focus-show/DSCF1055.webp", "sony-focus-show/DSCF1056.webp", "sony-focus-show/DSCF1057.webp", "sony-focus-show/DSCF1060.webp", "sony-focus-show/DSCF1061.webp", "sony-focus-show/DSCF1064.webp", "sony-focus-show/DSCF1065.webp", "sony-focus-show/DSCF1066.webp", "sony-focus-show/DSCF1067.webp", "sony-focus-show/DSCF1079.webp", "sony-focus-show/DSCF1097.webp", "sony-focus-show/DSCF1106.webp", "sony-focus-show/DSCF1109.webp", "sony-focus-show/DSCF1110.webp", "sony-focus-show/DSCF1112.webp", "sony-focus-show/DSCF1116.webp", "sony-focus-show/DSCF1118.webp"]}, {"id": "fashion4ukraine", "name": "Fashion4Ukraine", "frames": ["fashion4ukraine/DSCF0113.webp", "fashion4ukraine/DSCF0115.webp", "fashion4ukraine/DSCF0118.webp", "fashion4ukraine/DSCF0159.webp", "fashion4ukraine/DSCF0172.webp", "fashion4ukraine/DSCF0185.webp", "fashion4ukraine/DSCF0214.webp", "fashion4ukraine/DSCF0215.webp", "fashion4ukraine/DSCF0229.webp", "fashion4ukraine/DSCF0232.webp", "fashion4ukraine/DSCF0234.webp", "fashion4ukraine/DSCF0237.webp", "fashion4ukraine/DSCF0239.webp", "fashion4ukraine/DSCF0240.webp", "fashion4ukraine/DSCF0242.webp", "fashion4ukraine/DSCF0243.webp", "fashion4ukraine/DSCF0246.webp", "fashion4ukraine/DSCF0248.webp", "fashion4ukraine/DSCF0249.webp", "fashion4ukraine/DSCF0254.webp", "fashion4ukraine/DSCF0259.webp", "fashion4ukraine/DSCF0375.webp", "fashion4ukraine/DSCF0392.webp", "fashion4ukraine/DSCF0394.webp", "fashion4ukraine/DSCF0396.webp", "fashion4ukraine/DSCF0398.webp", "fashion4ukraine/DSCF0402.webp", "fashion4ukraine/DSCF0404.webp", "fashion4ukraine/DSCF0414.webp", "fashion4ukraine/DSCF0416.webp", "fashion4ukraine/DSCF0421.webp", "fashion4ukraine/DSCF0423.webp", "fashion4ukraine/DSCF0427.webp", "fashion4ukraine/DSCF0459.webp", "fashion4ukraine/DSCF0461.webp", "fashion4ukraine/DSCF0464.webp", "fashion4ukraine/DSCF0470.webp", "fashion4ukraine/DSCF0471.webp", "fashion4ukraine/DSCF0478.webp", "fashion4ukraine/DSCF0482.webp", "fashion4ukraine/DSCF0484.webp", "fashion4ukraine/DSCF0485.webp", "fashion4ukraine/DSCF0493.webp", "fashion4ukraine/DSCF0496.webp", "fashion4ukraine/DSCF0499.webp", "fashion4ukraine/DSCF0504.webp", "fashion4ukraine/DSCF0506.webp", "fashion4ukraine/DSCF0509.webp", "fashion4ukraine/DSCF0520.webp", "fashion4ukraine/DSCF0524.webp", "fashion4ukraine/DSCF0526.webp", "fashion4ukraine/DSCF0543.webp", "fashion4ukraine/DSCF0550.webp", "fashion4ukraine/DSCF0554.webp", "fashion4ukraine/DSCF0560.webp", "fashion4ukraine/DSCF0564.webp", "fashion4ukraine/DSCF0569.webp", "fashion4ukraine/DSCF0573.webp", "fashion4ukraine/DSCF0576.webp", "fashion4ukraine/DSCF0581.webp", "fashion4ukraine/DSCF0588.webp", "fashion4ukraine/DSCF0591.webp", "fashion4ukraine/DSCF0615.webp", "fashion4ukraine/DSCF0620.webp", "fashion4ukraine/DSCF0629.webp", "fashion4ukraine/DSCF0631.webp", "fashion4ukraine/DSCF0634.webp", "fashion4ukraine/DSCF0642.webp", "fashion4ukraine/DSCF0659.webp", "fashion4ukraine/DSCF0663.webp", "fashion4ukraine/DSCF0674.webp", "fashion4ukraine/DSCF0699.webp", "fashion4ukraine/DSCF0736.webp", "fashion4ukraine/DSCF0739.webp", "fashion4ukraine/DSCF0742.webp", "fashion4ukraine/DSCF0747.webp", "fashion4ukraine/DSCF0749.webp", "fashion4ukraine/DSCF0752.webp", "fashion4ukraine/DSCF0760.webp", "fashion4ukraine/DSCF0762.webp", "fashion4ukraine/DSCF0769.webp", "fashion4ukraine/DSCF0770.webp", "fashion4ukraine/DSCF0776.webp", "fashion4ukraine/DSCF0779.webp", "fashion4ukraine/DSCF0780.webp", "fashion4ukraine/DSCF0784.webp", "fashion4ukraine/DSCF0840.webp", "fashion4ukraine/DSCF0843.webp", "fashion4ukraine/DSCF0845.webp", "fashion4ukraine/DSCF0846.webp", "fashion4ukraine/DSCF0853.webp", "fashion4ukraine/DSCF0857.webp", "fashion4ukraine/DSCF1192.webp", "fashion4ukraine/DSCF1194.webp", "fashion4ukraine/DSCF1205.webp", "fashion4ukraine/DSCF1250.webp", "fashion4ukraine/DSCF1255.webp", "fashion4ukraine/DSCF1257.webp", "fashion4ukraine/DSCF1260.webp", "fashion4ukraine/DSCF1275.webp", "fashion4ukraine/DSCF1289.webp", "fashion4ukraine/DSCF1297.webp", "fashion4ukraine/DSCF1300.webp", "fashion4ukraine/DSCF1376.webp", "fashion4ukraine/DSCF1381.webp", "fashion4ukraine/DSCF1384.webp", "fashion4ukraine/DSCF1395.webp", "fashion4ukraine/DSCF1411.webp", "fashion4ukraine/DSCF1416.webp", "fashion4ukraine/DSCF1446.webp", "fashion4ukraine/DSCF1497.webp", "fashion4ukraine/DSCF1500.webp", "fashion4ukraine/DSCF1503.webp", "fashion4ukraine/DSCF1504.webp", "fashion4ukraine/DSCF1528.webp", "fashion4ukraine/DSCF1532.webp", "fashion4ukraine/DSCF1539.webp", "fashion4ukraine/DSCF1541.webp", "fashion4ukraine/DSCF1546.webp", "fashion4ukraine/DSCF1555.webp", "fashion4ukraine/DSCF1556.webp", "fashion4ukraine/DSCF1559.webp", "fashion4ukraine/DSCF1569.webp", "fashion4ukraine/DSCF1580.webp", "fashion4ukraine/DSCF1593.webp", "fashion4ukraine/DSCF1603.webp", "fashion4ukraine/DSCF1610.webp", "fashion4ukraine/DSCF1718.webp", "fashion4ukraine/DSCF1722.webp", "fashion4ukraine/DSCF1729.webp", "fashion4ukraine/DSCF1732.webp", "fashion4ukraine/DSCF1747.webp", "fashion4ukraine/DSCF1750.webp", "fashion4ukraine/DSCF1754.webp", "fashion4ukraine/DSCF1758.webp", "fashion4ukraine/DSCF1771.webp", "fashion4ukraine/DSCF1966.webp", "fashion4ukraine/DSCF2057.webp", "fashion4ukraine/DSCF2062.webp", "fashion4ukraine/DSCF2072.webp", "fashion4ukraine/DSCF2078.webp", "fashion4ukraine/DSCF2085.webp", "fashion4ukraine/DSCF2087.webp", "fashion4ukraine/DSCF2090.webp", "fashion4ukraine/DSCF2103.webp", "fashion4ukraine/DSCF2105.webp", "fashion4ukraine/DSCF2107.webp", "fashion4ukraine/DSCF2119.webp", "fashion4ukraine/DSCF2132.webp", "fashion4ukraine/DSCF2139.webp", "fashion4ukraine/DSCF2143.webp", "fashion4ukraine/DSCF2150.webp", "fashion4ukraine/DSCF2159.webp", "fashion4ukraine/DSCF2162.webp", "fashion4ukraine/DSCF2171.webp", "fashion4ukraine/DSCF2175.webp", "fashion4ukraine/DSCF2179.webp", "fashion4ukraine/DSCF2181.webp", "fashion4ukraine/DSCF2186.webp", "fashion4ukraine/DSCF2195.webp", "fashion4ukraine/DSCF2211.webp", "fashion4ukraine/DSCF2213.webp", "fashion4ukraine/DSCF2217.webp", "fashion4ukraine/DSCF2221.webp", "fashion4ukraine/DSCF2225.webp", "fashion4ukraine/DSCF2245.webp", "fashion4ukraine/DSCF2255.webp", "fashion4ukraine/DSCF2265.webp", "fashion4ukraine/DSCF2268.webp", "fashion4ukraine/DSCF2286.webp", "fashion4ukraine/DSCF2293.webp", "fashion4ukraine/DSCF2326.webp", "fashion4ukraine/DSCF2331.webp", "fashion4ukraine/DSCF2340.webp", "fashion4ukraine/DSCF2361.webp", "fashion4ukraine/DSCF2385.webp", "fashion4ukraine/DSCF2399.webp", "fashion4ukraine/DSCF2410.webp", "fashion4ukraine/DSCF2422.webp", "fashion4ukraine/DSCF2461.webp", "fashion4ukraine/DSCF2462.webp"]}, {"id": "joyce-aleks", "name": "Joyce + Aleks", "frames": ["joyce-alex/DSCF0005.webp", "joyce-alex/DSCF0009.webp", "joyce-alex/DSCF0011.webp", "joyce-alex/DSCF0015.webp", "joyce-alex/DSCF0019.webp", "joyce-alex/DSCF0021.webp", "joyce-alex/DSCF0028.webp", "joyce-alex/DSCF0034.webp", "joyce-alex/DSCF0046.webp", "joyce-alex/DSCF0059.webp", "joyce-alex/DSCF0063.webp", "joyce-alex/DSCF0066.webp", "joyce-alex/DSCF0072.webp", "joyce-alex/DSCF0076.webp", "joyce-alex/DSCF0090.webp", "joyce-alex/DSCF0094.webp", "joyce-alex/DSCF0104.webp", "joyce-alex/DSCF0111.webp", "joyce-alex/DSCF0113.webp", "joyce-alex/DSCF0126.webp", "joyce-alex/DSCF0134.webp", "joyce-alex/DSCF0141.webp", "joyce-alex/DSCF0155.webp", "joyce-alex/DSCF0182.webp", "joyce-alex/DSCF0195.webp", "joyce-alex/DSCF0224.webp", "joyce-alex/DSCF0234.webp", "joyce-alex/DSCF0259.webp", "joyce-alex/DSCF0275.webp", "joyce-alex/DSCF0314.webp", "joyce-alex/DSCF0335.webp", "joyce-alex/DSCF0392.webp", "joyce-alex/DSCF0440.webp", "joyce-alex/DSCF0463.webp", "joyce-alex/DSCF0478.webp", "joyce-alex/DSCF0490.webp", "joyce-alex/DSCF0533.webp", "joyce-alex/DSCF0588.webp", "joyce-alex/DSCF0625.webp"]}]);
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
