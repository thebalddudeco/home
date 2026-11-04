// User exclusions apply to still-photo galleries and the Polaroid reel.
const excludedPhotoAssets = new Set([
  "hero-backstage-gaze.jpg",
  "project-polaroids/soho-july-2026-04.jpg",
  "project-polaroids/soho-july-2026-05.jpg",
  "category-selects/soho-july-DSCF0684.jpg",
  "category-selects/soho-july-DSCF0690.jpg"
]);
const canonicalPhotoAssets = {
  "category-selects/soho-june-SOHO FASHION SHOW #34_1.jpg": "runway-floral.jpg",
  "category-selects/soho-june-SOHO FASHION SHOW #9_1.jpg": "runway-white.jpg",
  "category-selects/soho-july-DSCF0547.jpg": "chrome-visor.jpg",
  "wedding-joyce-alex-confetti.jpg": "wedding-joyce-alex-balcony.jpg",
  "wedding-joyce-alex-carry.jpg": "wedding-joyce-alex-balcony.jpg",
  "category-selects/joyce-DSCF0335.jpg": "wedding-joyce-alex-subway.jpg",
  "category-selects/joyce-DSCF0533.jpg": "wedding-joyce-alex-balcony.jpg"
};
