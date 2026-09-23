# Deployment and domain notes

## Production host

The production website is hosted by GitHub Pages from the root of the `main` branch in `thebalddudeco/home`.

- Repository: `https://github.com/thebalddudeco/home`
- Production URL: `https://www.thebalddude.co/`
- Pages source: `main` / repository root
- Custom-domain file: `CNAME`
- Jekyll bypass: `.nojekyll`

Every push to `main` starts a GitHub Pages build. A release should be created only after that build succeeds.

## DNS at Squarespace Domains

| Type | Name | Value |
| --- | --- | --- |
| CNAME | `www` | `thebalddudeco.github.io` |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

The Google Workspace MX records are not part of website hosting. Do not delete or replace them during a future site migration.

DNS caches may continue showing a previous host until the TTL that was active before the change expires. Lowering a TTL does not retroactively shorten an already-cached record. GitHub may temporarily show an apex-domain warning while its own DNS checker retains the former route, even after authoritative DNS is correct.

## External dependencies

- `work/work.js` loads `archive.json` from `TheBaldDudeCo/website-gallery` on Hugging Face.
- The contact form posts to FormSubmit for `info@thebalddude.co`.
- The playlist page loads `playlists.json` from this repository.
- Spotify content is embedded from Spotify.
- The scheduled `Sync Instagram feed` workflow uses Meta's official Instagram API when `INSTAGRAM_ACCESS_TOKEN` is configured as a repository secret. It downloads the latest twelve post images into repository assets so the access token is never exposed to browsers.
- If the Instagram token is missing, expired, or temporarily unavailable, the homepage keeps the twelve-image curated repository grid visible.

## Verification checklist

1. Confirm the GitHub Pages build for the current `main` commit reports `built`.
2. Confirm the Pages custom domain is `www.thebalddude.co` and HTTPS enforcement is enabled.
3. Confirm the authoritative CNAME points to `thebalddudeco.github.io`.
4. Confirm the apex returns all four GitHub Pages addresses.
5. Confirm the home page, `/work/`, and `/playlists/` load over HTTPS after DNS caches expire.
6. Confirm the Work archive loads its manifest and displays the expected gallery counts.
7. Confirm the Google Workspace MX records are unchanged.
8. Confirm the Instagram workflow has completed successfully and the homepage label reads `Live Instagram` after the API token is connected.

## Instagram live-feed activation

The feed uses the Instagram API with Instagram Login and the `instagram_business_basic` permission. The Instagram profile must be a Professional Business or Creator account.

1. In Meta for Developers, create or select a Business app and add the Instagram use case.
2. Authorize `@thebalddude.dng` and generate its user access token.
3. Save that token as the `INSTAGRAM_ACCESS_TOKEN` GitHub Actions repository secret. Never commit the token to this repository.
4. Run the `Sync Instagram feed` workflow manually once, then confirm it updates `instagram-feed.json` and the `assets/instagram-live-*` files.

The workflow refreshes every day at 10:17 UTC. If authorization expires, renew the repository secret; the public site continues showing the curated fallback until the next successful sync.

## Rollback

The previous production state is preserved on `pre-redesign-2026-09-20`. Review the branch first, restore the desired static files to `main`, retain the current `CNAME` unless the host is also changing, and allow the Pages build to complete before declaring the rollback live.
