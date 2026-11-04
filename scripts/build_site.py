"""Build the public site with appropriately sized photo copies; preserve sources."""
from pathlib import Path
import shutil
import subprocess
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '_site'
if OUTPUT.exists():
    raise RuntimeError('Build destination already exists; use a fresh build directory.')
files = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
for name in files:
    if not name or name.startswith(('.github/', 'scripts/', 'docs/')) or name.endswith(('.md', '.txt')):
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
print(f'Public website built: {total / 1024**2:.1f} MB. Source photographs unchanged.')
if total > 950 * 1024**2:
    raise RuntimeError('Public site exceeds the deployment size budget.')
