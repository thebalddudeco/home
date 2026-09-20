# The Bald Dude Co.

Production repository for [www.thebalddude.co](https://www.thebalddude.co), the photography portfolio of The Bald Dude Co.

The site is a static GitHub Pages deployment from the `main` branch. It includes the main portfolio, the dedicated Work archive, the playlist page, responsive styling, and the complete set of production assets used by those pages.

## Pages

- `/` — main portfolio and contact experience
- `/work/` — five horizontally scrollable galleries: Events, Editorial Fashion, Street, Studio Editorial, and Wedding
- `/playlists/` — music and playlist page

## Production assets

The `assets/` directory contains the current production images, brand graphics, posters, and motion files used by the website. The repository copy is hash-matched to the deployed build.

The larger Work archive is intentionally delivered from the public Hugging Face dataset [`TheBaldDudeCo/website-gallery`](https://huggingface.co/datasets/TheBaldDudeCo/website-gallery). Its `archive.json` manifest controls gallery membership and ordering while keeping the GitHub Pages deployment lightweight.

## Publishing

GitHub Pages publishes directly from the root of `main`. The `CNAME` file assigns `www.thebalddude.co`, and `.nojekyll` ensures every static file is served without Jekyll processing.

Squarespace remains the domain registrar and DNS manager. The website records point to GitHub Pages; Google Workspace MX records remain independent and must not be removed during website DNS changes.

## Current release

Version **2.0.0** is the full portfolio redesign. See [RELEASE_NOTES.md](RELEASE_NOTES.md) for the release summary and [CHANGELOG.md](CHANGELOG.md) for version history.

## Rights

Website design, copy, photographs, video, brand artwork, and other media are © The Bald Dude Co. unless otherwise noted. Repository visibility does not grant permission to reuse portfolio media.
