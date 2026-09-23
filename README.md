# The Bald Dude Co.

Production repository for [www.thebalddude.co](https://www.thebalddude.co), the high-flash editorial fashion and paparazzi-style photography portfolio of Justin von Braun and The Bald Dude Co.

![Release](https://img.shields.io/github/v/release/thebalddudeco/home?display_name=tag)
![GitHub Pages](https://img.shields.io/github/deployments/thebalddudeco/home/github-pages?label=GitHub%20Pages)

## Production status

- **Current release:** 2.4.0
- **Hosting:** GitHub Pages from the root of `main`
- **Custom domain:** `www.thebalddude.co`
- **Domain and DNS manager:** Squarespace Domains
- **Gallery media library:** [`TheBaldDudeCo/website-gallery`](https://huggingface.co/datasets/TheBaldDudeCo/website-gallery)
- **Previous production site:** preserved on `pre-redesign-2026-09-20`

## Site map

- `/` — primary portfolio, Joyce + Alex editorial wedding feature, about section, category-aware service inquiry cards, social links, and music feature
- `/work/` — Events, Editorial Fashion, Street, Studio Editorial, and Wedding galleries
- `/playlists/` — playlist archive and Spotify links

## Work archive

The Work page presents every still image inside a 3:4 frame without stretching it. Filename-based focal positions keep selected subjects centered, including images containing multiple people. Carousel controls wrap continuously in both directions.

The current public manifest contains:

| Gallery | Frames |
| --- | ---: |
| Events | 78 |
| Editorial Fashion | 362 |
| Street | 98 |
| Studio Editorial | 127 |
| Wedding | 55 |
| **Total** | **720** |

Penthouse Show is curated to 41 editorial photographs. Fashion4Ukraine adds 39 curated photographs across dedicated Events and Editorial Fashion albums. Original source files remain untouched; public gallery membership and ordering are controlled by the Hugging Face `archive.json` manifest.

## Repository assets

The `assets/` directory contains 44 baseline production assets used by the static site, plus the most recently synchronized Instagram images when live sync is configured. The homepage hero uses the original `DSCF0768.jpg` Sony Focus Show photograph, preserved byte-for-byte as `hero-sony-focus-dscf0768.jpg`. The six-image “Vows in Print” feature draws from the Joyce + Alex wedding edits and introduces the site's editorial, paparazzi-style wedding coverage directly on the homepage.

See [ASSET_MANIFEST.md](ASSET_MANIFEST.md) for the complete inventory.

## External services

- **Hugging Face:** public Work-gallery media and manifest
- **FormSubmit:** contact-form delivery to `info@thebalddude.co`
- **Spotify:** embedded playlist and playlist links
- **Instagram:** an official Instagram API sync runs daily through GitHub Actions when the repository secret is configured; the twelve-image curated repository grid remains as a no-cost fallback

## Publishing and domain routing

GitHub Pages publishes from `main` at the repository root. `CNAME` assigns `www.thebalddude.co`, and `.nojekyll` disables Jekyll processing.

Squarespace DNS routes the website to GitHub Pages:

- `CNAME www → thebalddudeco.github.io`
- `A @ → 185.199.108.153`
- `A @ → 185.199.109.153`
- `A @ → 185.199.110.153`
- `A @ → 185.199.111.153`

GitHub has approved the HTTPS certificate for both the `www` and apex domains. DNS checkers may temporarily retain the former Pixieset route until its previous TTL expires. Google Workspace MX records are independent of website hosting and must remain intact.

See [DEPLOYMENT.md](DEPLOYMENT.md) for publishing, DNS, verification, and rollback notes.

## Release history

- [Release notes](RELEASE_NOTES.md)
- [Changelog](CHANGELOG.md)
- [GitHub releases](https://github.com/thebalddudeco/home/releases)

## Rights

Website design, copy, photographs, video, brand artwork, and other media are © The Bald Dude Co. unless otherwise noted. Public repository access does not grant permission to reproduce or reuse portfolio media.
