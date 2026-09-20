# Release notes

## Version 2.0.0 — September 20, 2026

This release replaces the previous portfolio with the redesigned The Bald Dude Co. experience and moves production hosting to GitHub Pages from the `home` repository.

### Highlights

- Introduced a fully redesigned main portfolio with the established black, cream, and electric-pink visual system.
- Added a dedicated `/work/` archive with five galleries: Events, Editorial Fashion, Street, Studio Editorial, and Wedding.
- Standardized still-image presentation to a 3:4 crop without stretching or squashing source photographs.
- Added filename-based focal framing for photographs that need subject-aware positioning.
- Made every gallery carousel wrap continuously in both directions.
- Shortened the Street section title to prevent collisions with the frame count and navigation controls.
- Curated Penthouse Show from 96 frames to 41 stronger editorial selections while preserving every original source file.
- Removed Emily and Pedro from the public Wedding gallery.
- Added the playlist experience at `/playlists/`.
- Updated all production brand, image, poster, and motion assets in the repository.
- Connected the production domain through GitHub Pages using `www.thebalddude.co`.

### Gallery delivery

The Work page reads its current gallery manifest from the public `TheBaldDudeCo/website-gallery` dataset on Hugging Face. This keeps the Pages repository efficient while allowing gallery curation without recompressing or deleting originals.

### Preservation

The previous `home` deployment remains available on the `pre-redesign-2026-09-20` branch.
