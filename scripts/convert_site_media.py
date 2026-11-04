"""Create web-format derivatives and a manifest without modifying original media."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from PIL import Image, ImageOps
import hashlib
import json
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'scripts' / 'web-media-map.json'
REENCODE_VIDEOS = '--videos-only' in sys.argv
extensions = {'.jpg', '.jpeg', '.png', '.mp4', '.mov'}
sources = sorted(p for p in ROOT.rglob('*') if p.is_file()
    and not {'.git', '_site', '__pycache__'}.intersection(p.relative_to(ROOT).parts)
    and p.suffix.lower() in extensions)
mapping = {}
for source in sources:
    target = source.with_suffix('.webm' if source.suffix.lower() in ('.mp4', '.mov') else '.webp')
    if (target.exists() and target.suffix==source.suffix) or target.relative_to(ROOT).as_posix() in mapping.values():
        target = source.with_name(source.stem + '-' + source.suffix[1:] + target.suffix)
    mapping[source.relative_to(ROOT).as_posix()] = target.relative_to(ROOT).as_posix()


def convert(source):
    name = source.relative_to(ROOT).as_posix()
    target = ROOT / mapping[name]
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    if target.exists() and target.stat().st_size > 0 and not REENCODE_VIDEOS:
        return name, {'target':mapping[name], 'source_sha256':digest, 'bytes':target.stat().st_size}
    if source.suffix.lower() in ('.mp4', '.mov'):
        temporary = target.with_name(target.stem + '.converting.webm')
        command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
            '-map', '0:v:0', '-map', '0:a?', '-vf',
            'scale=1920:1920:force_original_aspect_ratio=decrease:force_divisible_by=2',
            '-c:v', 'av1_nvenc', '-preset', 'p5', '-rc', 'vbr', '-cq', '32',
            '-b:v', '2500k', '-maxrate', '4000k', '-bufsize', '8000k', '-pix_fmt', 'yuv420p',
            '-c:a', 'libopus', '-b:a', '128k', str(temporary)]
        subprocess.run(command, check=True, stdout=subprocess.DEVNULL)
        temporary.replace(target)
        probe = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
            'format=duration:stream=codec_name,codec_type,width,height', '-of', 'json', str(target)])
        details = json.loads(probe)
        original = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries',
            'format=duration:stream=codec_type','-of','json',str(source)]))
        assert abs(float(details['format']['duration'])-float(original['format']['duration'])) < 0.3, name
        assert sum(s['codec_type']=='audio' for s in details['streams']) == sum(s['codec_type']=='audio' for s in original['streams']), name
        assert next(s for s in details['streams'] if s['codec_type']=='video')['codec_name'] in ('av1','vp9')
    else:
        with Image.open(source) as image:
            image = ImageOps.exif_transpose(image)
            original_size = image.size
            image.thumbnail((2560, 2560), Image.Resampling.LANCZOS)
            options = {'quality': 88, 'method': 5}
            if source.suffix.lower()=='.png' and max(original_size)<=1200:
                options['lossless'] = True
            if image.info.get('icc_profile'):
                options['icc_profile'] = image.info['icc_profile']
            image.save(target, 'WEBP', **options)
            expected = image.size
        with Image.open(target) as check:
            check.load()
            assert check.size == expected, name
    assert hashlib.sha256(source.read_bytes()).hexdigest()==digest, name
    return name, {'target':mapping[name], 'source_sha256':digest, 'bytes':target.stat().st_size}


if __name__ == '__main__':
    photos=[p for p in sources if p.suffix.lower() not in ('.mp4','.mov')]
    videos=[p for p in sources if p.suffix.lower() in ('.mp4','.mov')]
    if REENCODE_VIDEOS:
        photos=[]
    results=json.loads(MANIFEST.read_text()) if REENCODE_VIDEOS else {}
    for group, workers in [(photos,6),(videos,2)]:
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures=[pool.submit(convert,p) for p in group]
            for future in as_completed(futures):
                name, result=future.result()
                results[name]=result
                print(f'Converted {len(results)}/{len(sources)}: {name}',flush=True)
    MANIFEST.write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
    print('All derivatives verified; original hashes unchanged.',flush=True)
