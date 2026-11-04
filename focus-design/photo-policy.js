// User exclusions apply to still-photo galleries and the Polaroid reel.
const excludedPhotoAssets = new Set([
  "hero-backstage-gaze.jpg",
  "project-polaroids/soho-july-2026-04.jpg",
  "project-polaroids/soho-july-2026-05.jpg",
  "category-selects/soho-july-DSCF0684.jpg",
  "category-selects/soho-july-DSCF0690.jpg"
]);
const canonicalPhotoAssets = {
  "category-selects/soho-june-SOHO FASHION SHOW #34_1.webp": "runway-floral.webp",
  "category-selects/soho-june-SOHO FASHION SHOW #9_1.webp": "runway-white.webp",
  "category-selects/soho-july-DSCF0547.webp": "chrome-visor.webp",
  "wedding-joyce-alex-confetti.webp": "wedding-joyce-alex-balcony.webp",
  "wedding-joyce-alex-carry.webp": "wedding-joyce-alex-balcony.webp",
  "category-selects/joyce-DSCF0335.webp": "wedding-joyce-alex-subway.webp",
  "category-selects/joyce-DSCF0533.webp": "wedding-joyce-alex-balcony.webp"
};
