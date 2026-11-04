"""Build the public site with appropriately sized photo copies; preserve sources."""
from pathlib import Path
import shutil
import subprocess
import json
import sys
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / (sys.argv[1] if len(sys.argv) > 1 else '_site')
if OUTPUT.parent != ROOT or not OUTPUT.name.startswith('_site'):
    raise RuntimeError('Build destination must be a named _site directory inside this project.')
if OUTPUT.exists():
    raise RuntimeError('Build destination already exists; use a fresh build directory.')
files = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
media_manifest = ROOT / 'scripts/web-media-map.json'
converted_sources = json.loads(media_manifest.read_text(encoding='utf-8')) if media_manifest.exists() else {}
for name in files:
    if not name or name.startswith(('.github/', 'scripts/', 'docs/')) or (name.endswith(('.md', '.txt')) and name != 'robots.txt'):
        continue
    if name in converted_sources:
        if not (ROOT / converted_sources[name]['target']).is_file():
            raise RuntimeError(f'Missing converted media: {name}')
        continue
    source = ROOT / name
    if not source.is_file():
        continue
    target = OUTPUT / name
    target.parent.mkdir(parents=True, exist_ok=True)
    if source.suffix.lower() in ('.jpg', '.jpeg'):
        with Image.open(source) as image:
            if max(image.size) > 2560 or source.stat().st_size > 1024 * 1024:
                image = ImageOps.exif_transpose(image)
                image.thumbnail((2560, 2560), Image.Resampling.LANCZOS)
                options = {'quality': 88, 'optimize': True, 'progressive': True}
                if image.info.get('icc_profile'):
                    options['icc_profile'] = image.info['icc_profile']
                image.convert('RGB').save(target, 'JPEG', **options)
                continue
    shutil.copy2(source, target)
feed = ROOT / 'google-reviews.json'
if feed.exists():
    shutil.copy2(feed, OUTPUT / feed.name)
total = sum(p.stat().st_size for p in OUTPUT.rglob('*') if p.is_file())
if converted_sources:
    obsolete = [p for p in OUTPUT.rglob('*') if p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.mp4', '.mov')]
    if obsolete:
        raise RuntimeError(f'Unconverted public media: {obsolete[0].relative_to(OUTPUT)}')
print(f'Public website built: {total / 1024**2:.1f} MB. Source photographs unchanged.')
if total > 950 * 1024**2:
    raise RuntimeError('Public site exceeds the deployment size budget.')
