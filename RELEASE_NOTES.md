# Release notes

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
