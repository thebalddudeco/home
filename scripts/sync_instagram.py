from __future__ import annotations

import json
import io
import mimetypes
import os
import re
import urllib.parse
import urllib.request
import urllib.error
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


def main() -> None:
    if not TOKEN:
        print("INSTAGRAM_ACCESS_TOKEN is not configured; keeping the curated fallback.")
        return
    config_path = ROOT / 'scripts' / 'instagram-profile-grid.json'
    config = json.loads(config_path.read_text(encoding='utf-8')) if config_path.exists() else {}
    normalize = lambda value: (value or '').rstrip('/')
    pinned = [normalize(url) for url in config.get('pinnedPermalinks', [])]
    confirmed = {normalize(url) for url in config.get('observedGridPermalinks', [])}
    query = urllib.parse.urlencode({'fields': FIELDS, 'limit': 100})
    next_url = f'{ENDPOINT}?{query}'
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

    for old_asset in ASSETS.glob("instagram-live-*"):
        old_asset.unlink()

    items = []
    for index, post in enumerate(media[:12], start=1):
        image_url = post.get("thumbnail_url") or post.get("media_url")
        if not image_url:
            continue
        local = download(image_url, ASSETS / f"instagram-live-{index:02d}")
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

    OUTPUT.write_text(json.dumps({
        "source": "instagram-api",
        "scope": "profile-grid",
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "items": items,
    }, indent=2) + "\n", encoding="utf-8")
    print(f"Synced {len(items)} Instagram posts.")


if __name__ == "__main__":
    main()
