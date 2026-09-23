from __future__ import annotations

import json
import mimetypes
import os
import re
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUTPUT = ROOT / "instagram-feed.json"
TOKEN = os.environ.get("INSTAGRAM_ACCESS_TOKEN", "").strip()
FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"
ENDPOINT = "https://graph.instagram.com/v24.0/me/media"


def request_json(url: str) -> dict:
    request = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {TOKEN}",
        "User-Agent": "TheBaldDudeCo-Instagram-Sync/1.0",
    })
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def download(url: str, destination_stem: Path) -> Path:
    request = urllib.request.Request(url, headers={"User-Agent": "TheBaldDudeCo-Instagram-Sync/1.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        data = response.read()
        content_type = response.headers.get_content_type()
    extension = mimetypes.guess_extension(content_type) or ".jpg"
    if extension == ".jpe":
        extension = ".jpg"
    destination = destination_stem.with_suffix(extension)
    destination.write_bytes(data)
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
    query = urllib.parse.urlencode({"fields": FIELDS, "limit": 12})
    payload = request_json(f"{ENDPOINT}?{query}")
    media = payload.get("data", [])
    if not media:
        raise RuntimeError("Instagram returned no media; the existing feed was left unchanged.")

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
        })

    if not items:
        raise RuntimeError("Instagram returned no usable images; the existing feed was left unchanged.")

    OUTPUT.write_text(json.dumps({
        "source": "instagram-api",
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "items": items,
    }, indent=2) + "\n", encoding="utf-8")
    print(f"Synced {len(items)} Instagram posts.")


if __name__ == "__main__":
    main()
