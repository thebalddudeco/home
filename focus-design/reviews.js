'use strict';
(async () => {
  const section = document.querySelector('#reviews');
  if (!section) return;
  const stars = {ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5};
  const safeGoogleUrl = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && ['google.com', 'www.google.com', 'maps.google.com'].includes(url.hostname) ? url.href : null;
    } catch { return null; }
  };
  try {
    const response = await fetch(new URL('/google-reviews.json', document.baseURI), {cache: 'no-store'});
    if (!response.ok) return; // Keep the supplied review excerpts until Google is connected.
    const feed = await response.json();
    const age = Date.now() - Date.parse(feed.syncedAt);
    const data = feed.data;
    const sourceUrl = safeGoogleUrl(feed.googleMapsUrl);
    if (feed.source !== 'google-business-profile' || !sourceUrl || !Number.isFinite(age) || age < -300000 || age > 29 * 86400000 ||
        !data || !Array.isArray(data.reviews) || data.reviews.length !== data.totalReviewCount ||
        !Number.isInteger(data.totalReviewCount) || data.totalReviewCount < 0 ||
        typeof data.averageRating !== 'number' || data.averageRating < 0 || data.averageRating > 5 ||
        data.reviews.some(review => !stars[review.starRating])) return;

    const fragment = document.createDocumentFragment();
    data.reviews.forEach((review, index) => {
      const rating = stars[review.starRating];
      const figure = document.createElement('figure');
      figure.className = 'review-card'; figure.hidden = index >= 6;
      const score = document.createElement('div');
      score.className = 'review-stars'; score.setAttribute('role', 'img');
      score.setAttribute('aria-label', `${rating} out of 5 stars`);
      score.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      const quote = document.createElement('blockquote');
      quote.textContent = review.comment ? `“${review.comment}”` : 'Rating without a written review.';
      const caption = document.createElement('figcaption');
      const author = document.createElement('span');
      author.textContent = review.reviewer?.isAnonymous ? 'Google reviewer' : (review.reviewer?.displayName || 'Google reviewer');
      const label = document.createElement('small'); label.textContent = 'GOOGLE REVIEW';
      caption.append(author, label);
      const link = document.createElement('a');
      link.href = sourceUrl; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.textContent = 'VIEW ON GOOGLE';
      link.setAttribute('aria-label', `View reviews for The Bald Dude Co. on Google`);
      figure.append(score, quote, caption, link); fragment.append(figure);
    });
    const grid = section.querySelector('.reviews-grid');
    grid.replaceChildren(fragment);
    const summary = section.querySelector('.reviews-rating');
    const number = document.createElement('strong');
    number.textContent = data.totalReviewCount ? data.averageRating.toFixed(1) : '—';
    const outOf = document.createElement('span'); outOf.textContent = '/ 5'; number.append(outOf);
    const summaryStars = document.createElement('span'); summaryStars.className = 'review-stars';
    summaryStars.setAttribute('aria-hidden', 'true');
    summaryStars.textContent = data.totalReviewCount ? '★'.repeat(Math.round(data.averageRating)) + '☆'.repeat(5 - Math.round(data.averageRating)) : '';
    const count = document.createElement('small');
    count.textContent = `${data.totalReviewCount} ${data.totalReviewCount === 1 ? 'REVIEW' : 'REVIEWS'} ON GOOGLE`;
    summary.replaceChildren(number, summaryStars, count); summary.href = sourceUrl;
    summary.setAttribute('aria-label', `${data.averageRating.toFixed(1)} out of 5 from ${data.totalReviewCount} Google reviews`);
    section.querySelector('.reviews-footer>span').textContent = 'GOOGLE REVIEWS / MOST RECENTLY UPDATED FIRST';
    if (data.reviews.length > 6) {
      const more = document.createElement('button'); more.className = 'reviews-more';
      more.textContent = 'MORE REVIEWS';
      more.addEventListener('click', () => {
        [...grid.querySelectorAll('[hidden]')].slice(0, 6).forEach(card => { card.hidden = false; });
        if (!grid.querySelector('[hidden]')) more.remove();
      });
      grid.after(more);
    }
    section.dataset.reviewSource = 'google-business-profile';
  } catch {
    // A failed update must not remove the existing, user-supplied testimonials.
  }
})();
