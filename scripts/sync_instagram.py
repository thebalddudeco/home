from __future__ import annotations

import json
import io
import hashlib
import mimetypes
import os
import re
import urllib.parse
import urllib.request
import urllib.error
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUTPUT = ROOT / "instagram-feed.json"
TOKEN = os.environ.get("INSTAGRAM_ACCESS_TOKEN", "").strip()
FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,is_shared_to_feed"
ENDPOINT = "https://graph.instagram.com/v24.0/me/media"


def request_json(url: str) -> dict:
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != 'https' or parsed.hostname not in ('graph.instagram.com', 'graph.facebook.com'):
        raise RuntimeError('Refusing to send Instagram credentials outside Meta Graph API.')
    request = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {TOKEN}",
        "User-Agent": "TheBaldDudeCo-Instagram-Sync/1.0",
    })
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        try:
            detail = json.loads(error.read()).get('error', {})
            message = str(detail.get('message', 'Request rejected')).replace(TOKEN, '[redacted]')
            code = detail.get('code', error.code)
        except (ValueError, TypeError):
            message, code = 'Request rejected', error.code
        raise RuntimeError(f'Instagram sync failed (HTTP {error.code}, code {code}): {message}') from None


def media_endpoint() -> str:
    mode = os.environ.get('INSTAGRAM_LOGIN_MODE', '').strip() or 'instagram'
    if mode == 'instagram':
        return ENDPOINT
    expected = os.environ.get('INSTAGRAM_EXPECTED_USERNAME', 'thebalddude.dng').strip().lower().lstrip('@')
    if mode == 'facebook':
        # Resolve the already-linked Page directly; never read unrelated Pages.
        page_id = os.environ.get('INSTAGRAM_FACEBOOK_PAGE_ID', '296434676893088').strip()
        if not page_id.isdigit():
            raise RuntimeError('A numeric Facebook Page ID is required; existing feed remains unchanged.')
        fields = urllib.parse.urlencode({'fields': 'id,instagram_business_account{id,username}'})
        page = request_json(f'https://graph.facebook.com/v27.0/{page_id}?{fields}')
        account = page.get('instagram_business_account') or {}
        if (str(page.get('id', '')) != page_id or
                str(account.get('username', '')).lower() != expected or
                not str(account.get('id', '')).isdigit()):
            raise RuntimeError(f'The selected Facebook Page has not exposed @{expected}; '
                               'existing feed remains unchanged.')
        return f"https://graph.facebook.com/v27.0/{account['id']}/media"
    if mode != 'unified':
        raise RuntimeError('Unknown Instagram login mode.')
    accounts = request_json('https://graph.facebook.com/v27.0/me/assigned_instagram_accounts?fields=id,username')
    matching = [account for account in accounts.get('data', [])
                if str(account.get('username', '')).lower() == expected]
    if len(matching) != 1 or not str(matching[0].get('id', '')).isdigit():
        raise RuntimeError(f'Meta has not exposed exactly one assigned Instagram account for @{expected}. '
                           'Reconnect that Instagram asset in the website app; existing feed remains unchanged.')
    return f"https://graph.facebook.com/v27.0/{matching[0]['id']}/media"


def download(url: str, destination_stem: Path) -> Path:
    request = urllib.request.Request(url, headers={"User-Agent": "TheBaldDudeCo-Instagram-Sync/1.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        data = response.read()
        content_type = response.headers.get_content_type()
    destination = destination_stem.with_suffix('.webp')
    with Image.open(io.BytesIO(data)) as image:
        image = ImageOps.exif_transpose(image)
        image.thumbnail((2560, 2560), Image.Resampling.LANCZOS)
        image.save(destination, 'WEBP', quality=88, method=5)
    return destination


def alt_text(caption: str | None) -> str:
    if not caption:
        return "Recent photograph from @thebalddude.dng on Instagram"
    clean = re.sub(r"\s+", " ", caption).strip()
    return clean[:180]


def normalize_permalink(value: str | None) -> str:
    # Meta omits the username in API links; the profile UI includes it.
    path = urllib.parse.urlsplit(value or '').path
    match = re.search(r'/(p|reel|tv)/([^/]+)', path)
    return f'https://www.instagram.com/{match[1]}/{match[2]}' if match else (value or '').rstrip('/')


def main() -> None:
    if not TOKEN:
        print("INSTAGRAM_ACCESS_TOKEN is not configured; keeping the curated fallback.")
        return
    config_path = ROOT / 'scripts' / 'instagram-profile-grid.json'
    config = json.loads(config_path.read_text(encoding='utf-8')) if config_path.exists() else {}
    normalize = normalize_permalink
    pinned = [normalize(url) for url in config.get('pinnedPermalinks', [])]
    confirmed = {normalize(url) for url in config.get('observedGridPermalinks', [])}
    query = urllib.parse.urlencode({'fields': FIELDS, 'limit': 100})
    next_url = f'{media_endpoint()}?{query}'
    media = []
    seen = set()
    for _ in range(10):
        payload = request_json(next_url)
        for post in payload.get('data', []):
            permalink = normalize(post.get('permalink'))
            on_grid = (post.get('media_type') in ('IMAGE', 'CAROUSEL_ALBUM')
                       or post.get('is_shared_to_feed') is True
                       or permalink in confirmed)
            if on_grid and permalink and permalink not in seen:
                seen.add(permalink)
                media.append(post)
        next_url = payload.get('paging', {}).get('next')
        if not next_url or (len(media) >= 12 and all(url in seen for url in pinned)):
            break
    if not media:
        raise RuntimeError('No main profile-grid media returned; keeping the existing feed.')
    media.sort(key=lambda post: (
        0 if normalize(post.get('permalink')) in pinned else 1,
        pinned.index(normalize(post.get('permalink'))) if normalize(post.get('permalink')) in pinned else 0,
    ))

    items = []
    # Download and decode everything before replacing the last successful feed.
    # Content-based names keep its images intact even if a later operation fails.
    with tempfile.TemporaryDirectory(prefix='.instagram-stage-', dir=ASSETS) as staging:
        ready = []
        for index, post in enumerate(media[:12], start=1):
            image_url = post.get("thumbnail_url") or post.get("media_url")
            if not image_url:
                continue
            staged = download(image_url, Path(staging) / f'photo-{index:02d}')
            digest = hashlib.sha256(staged.read_bytes()).hexdigest()[:24]
            local = ASSETS / f'instagram-live-{digest}.webp'
            ready.append((staged, local))
            items.append({
                "id": post.get("id"),
                "image": local.relative_to(ROOT).as_posix(),
                "permalink": post.get("permalink"),
                "alt": alt_text(post.get("caption")),
                "timestamp": post.get("timestamp"),
                "mediaType": post.get("media_type"),
                "pinned": normalize(post.get("permalink")) in pinned,
            })
        if not items:
            raise RuntimeError("Instagram returned no usable images; the existing feed was left unchanged.")
        for staged, local in ready:
            os.replace(staged, local)
        pending = Path(staging) / 'feed.json'
        pending.write_text(json.dumps({
            "source": "instagram-api",
            "scope": "profile-grid",
            "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "items": items,
        }, indent=2) + "\n", encoding="utf-8")
        os.replace(pending, OUTPUT)
    keep = {item['image'] for item in items}
    for old_asset in ASSETS.glob('instagram-live-*'):
        if old_asset.is_file() and old_asset.relative_to(ROOT).as_posix() not in keep:
            old_asset.unlink()
    print(f"Synced {len(items)} Instagram posts.")


if __name__ == "__main__":
    main()
