# Release notes

## Version 2.3.0 — September 23, 2026

Version 2.3.0 expands the portfolio while clarifying how prospective clients move through the site.

### Homepage and inquiries

- The final About paragraph now describes an editorial approach built around energy, polish, point of view, and making subjects feel confident and seen.
- The top-right Book Me button now moves directly to Available For, where visitors choose the service that fits their project before opening its tailored inquiry card.
- Two Fashion4Ukraine photographs now appear in the homepage selected-work wall.

### Work archive

- Added a dedicated eight-frame Fashion4Ukraine Events album.
- Added a dedicated 31-frame Fashion4Ukraine Editorial Fashion album.
- The public archive now contains 720 photographs across 22 albums. Originals remain untouched.

### Instagram

- Added a scheduled, no-cost feed sync built on Meta's official Instagram API.
- The synchronization downloads the latest twelve post images during a private GitHub Actions job, keeping the access token out of the public site.
- The current curated twelve-image grid remains visible whenever the token has not been connected or a refresh cannot complete.

## Version 2.2.2 — September 21, 2026

Version 2.2.2 updates Events + Backstage coverage to begin at $750. Its inquiry card now presents a $750–$3,750+ starting range, and its category-specific estimated-budget menu begins at $750–$1,250 before continuing through the existing higher tiers.

## Version 2.2.1 — September 21, 2026

Version 2.2.1 restores the homepage Instagram gallery. GitHub Pages cannot run the former server-side feed endpoint, so the site now renders its twelve curated Instagram photographs directly from the repository. Every tile links to `@thebalddude.dng`, and the broken loading and unavailable states have been removed.

## Version 2.2.0 — September 21, 2026

Version 2.2.0 simplifies the homepage presentation. The hero is now a single Sony Focus Show photograph supplied by Justin, with no video or rotating frames. Portfolio, portrait, and Instagram images now enter with a clean fade-and-rise transition instead of the checkerboard reveal.

## Version 2.1.2 — September 20, 2026

Version 2.1.2 aligns the estimated-budget dropdown with each service’s published pricing. Selecting Fashion + Editorial, Events + Backstage, Portraits, Weddings, or Commercial now loads category-specific tiers beginning at that service’s minimum price.

## Version 2.1.1 — September 20, 2026

Version 2.1.1 corrects the responsive layout of every category-specific inquiry card. The modal is wider on large displays, with more separation between the headline and form, and switches to a stacked layout at tablet widths to prevent any overlap.

## Version 2.1.0 — September 20, 2026

Version 2.1.0 turns the shared contact form into five distinct service inquiry experiences.

### Service-specific inquiries

- Each service button now opens with its own headline, positioning copy, and preselected project type.
- Portraits display a $650–$1,350 starting range.
- Fashion + Editorial displays a $950–$3,200+ starting range.
- Events + Backstage displays a $1,250–$3,750+ starting range.
- Weddings displays a $1,250–$2,750+ starting range.
- Commercial displays a $1,500–$5,000+ creative-fee range and notes that licensing and production are quoted separately.
- The selected service and its pricing context are included with every submitted inquiry.

## Version 2.0.2 — September 20, 2026

Version 2.0.2 realigns the public brand language with Justin von Braun’s current photographic focus.

### Brand positioning

- Rewrote the About section around high-flash editorial fashion and paparazzi-style photography.
- Extended that positioning across fashion events, weddings, portraits, campaigns, and brand work.
- Updated the hero introduction, specialty ticker, manifesto, and service descriptions.
- Updated the home and Work metadata used by search engines and link previews.
- Updated the repository description and documentation to match the live website.

## Version 2.0.1 — September 20, 2026

Version 2.0.1 completes the repository and production-hosting alignment for the redesigned portfolio.

### Repository and assets

- Verified all 35 production assets against the current site build using SHA-256.
- Confirmed zero missing, extra, or mismatched production assets.
- Added a complete production asset inventory.
- Expanded the README with the current architecture, gallery totals, services, publishing configuration, DNS records, release history, and rollback location.
- Added dedicated deployment and recovery documentation.
- Updated the GitHub repository description and production homepage.

### Hosting and domain

- Confirmed GitHub Pages publishes from the root of `main` in `thebalddudeco/home`.
- Confirmed `www.thebalddude.co` as the Pages custom domain with HTTPS enabled.
- Replaced the former Pixieset route with the GitHub Pages CNAME.
- Added the four recommended GitHub Pages apex `A` records.
- Confirmed GitHub approved a certificate covering both `www.thebalddude.co` and `thebalddude.co`.
- Preserved all Google Workspace MX records.
- Preserved the previous production state on `pre-redesign-2026-09-20`.

DNS resolvers that cached the former Pixieset records may continue showing that route until the TTL active before the cutover expires.

### Gallery state

- Documented the 681-frame public Work archive and its five gallery totals.
- Documented the curated 41-frame Penthouse Show selection.
- Documented the Hugging Face manifest as the source of gallery membership and order.

## Version 2.0.0 — September 20, 2026

Version 2.0.0 replaced the previous portfolio with the redesigned The Bald Dude Co. experience.

### Highlights

- Introduced the redesigned main portfolio with the established black, cream, and electric-pink visual system.
- Added a dedicated `/work/` archive with Events, Editorial Fashion, Street, Studio Editorial, and Wedding galleries.
- Standardized still-image presentation to a 3:4 crop without stretching or squashing source photographs.
- Added filename-based focal framing for subject-aware positioning.
- Made every gallery carousel wrap continuously in both directions.
- Shortened the Street section title to prevent collisions with the frame count and controls.
- Curated Penthouse Show from 96 frames to 41 editorial selections while preserving every original source file.
- Removed Emily and Pedro from the public Wedding gallery.
- Added the playlist experience at `/playlists/`.
- Updated production brand, image, poster, and motion assets.

### Gallery delivery

The Work page reads its public gallery manifest from the `TheBaldDudeCo/website-gallery` dataset on Hugging Face. This keeps the Pages repository efficient while allowing gallery curation without recompressing or deleting originals.
