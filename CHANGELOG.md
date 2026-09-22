# Changelog

All notable production changes to The Bald Dude Co. website are recorded here.

## [2.2.2] — 2026-09-21

### Changed

- Lowered the Events + Backstage starting price from $1,250 to $750.
- Updated the Events + Backstage inquiry budget menu to begin at $750–$1,250 while preserving the existing higher tiers.

## [2.2.1] — 2026-09-21

### Fixed

- Replaced the unsupported `/api/instagram-feed` request with the repository's twelve-image Instagram grid.
- Removed the unavailable-feed state so the homepage social gallery renders reliably on GitHub Pages.

## [2.2.0] — 2026-09-21

### Changed

- Replaced the mixed-media homepage hero rotation with the single supplied Sony Focus Show photograph `DSCF0768.jpg`.
- Replaced checkerboard image reveals with a restrained fade-and-rise transition.

### Removed

- Homepage hero video playback, slideshow timing, flash transitions, and sequence counting.
- Checkerboard tile generation and animation from portfolio, portrait, and Instagram image reveals.

## [2.1.2] — 2026-09-20

### Changed

- Each service inquiry card now supplies its own estimated-budget ranges.
- Budget choices begin at the published minimum for the selected service and scale upward without presenting below-minimum options.

## [2.1.1] — 2026-09-20

### Fixed

- Widened every service inquiry card on large screens so display headlines remain clear of the form fields.
- Stacked the inquiry-card introduction above the form at tablet widths before the two-column layout can collide.

## [2.1.0] — 2026-09-20

### Added

- Category-specific inquiry-card headlines, supporting copy, and pricing guidance for all five services.
- Premium starting ranges for Portraits, Fashion + Editorial, Events + Backstage, Weddings, and Commercial work.
- Starting-price context in submitted inquiry data.

### Changed

- Service buttons now open a contact experience tailored to the selected category.
- Commercial inquiries now clarify that licensing and production costs are quoted separately.

## [2.0.2] — 2026-09-20

### Changed

- Repositioned the public brand around high-flash editorial fashion and paparazzi-style photography.
- Rewrote the full About section to reflect Justin von Braun’s current focus.
- Aligned the hero, specialty ticker, manifesto, services, page metadata, README, and repository description with the new positioning.

## [2.0.1] — 2026-09-20

### Added

- Complete 35-file production asset inventory.
- Deployment, DNS, verification, and rollback documentation.
- Current gallery counts and external-service architecture in the README.

### Changed

- Finalized the GitHub Pages custom-domain configuration replacing Pixieset.
- Added all four recommended GitHub Pages apex addresses.
- Updated repository metadata, release documentation, and production status.
- Verified the repository assets against the production build with SHA-256.

### Preserved

- Google Workspace MX records.
- Previous production site on `pre-redesign-2026-09-20`.
- Original gallery source photographs outside the public curation manifest.

## [2.0.0] — 2026-09-20

### Added

- New main portfolio design and navigation system.
- Separate Work archive with five carousel galleries.
- Infinite previous/next carousel wrapping.
- Subject-aware focal positions for selected 3:4 image crops.
- Playlist page and current production media assets.
- GitHub Pages custom-domain configuration.

### Changed

- Renamed the visible Street Photography heading to Street.
- Curated Penthouse Show from 96 public frames to 41 editorial selections.
- Updated spacing, typography, alignment, and responsive behavior throughout the site.
- Moved production hosting to GitHub Pages from the `home` repository.

### Removed

- Emily and Pedro photographs from the public Wedding gallery.
- Superseded portfolio markup and styling from the production branch.

## [1.2.0] — 2026-04-10

- Added MP4 media support and synchronized portfolio copy.
