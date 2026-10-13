#!/usr/bin/env python3
"""Crop, resize and encode the two-path photos to WebP under their byte budgets.

Usage:
  python3 scripts/photos/export-webp.py --src-dir DIR [--only ID ...]

Reads scripts/photos/jobs.json and writes public/images/two-path/<id>.webp. Each job:
  id       output name
  src      file name inside --src-dir
  box      optional [x0, y0, x1, y1] pre-crop as fractions of the source
  boxPx    optional [x0, y0, x1, y1] pre-crop in source pixels (screenshots)
  ratio    optional "W:H"; largest whole-number crop of that ratio inside the box, centred on focal
  focal    optional [x, y] fractions of the box (default [0.5, 0.5])
  width    target width; never upscales (keeps the crop size when it is smaller)
  budget   max bytes; quality steps down by 5 from `quality` (default 82) until the file fits
Requires Pillow and cwebp (brew install webp).
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT_DIR = os.path.join(ROOT, 'public', 'images', 'two-path')
MIN_QUALITY = 40


def crop_box(image, job):
    width, height = image.size
    if 'boxPx' in job:
        x0, y0, x1, y1 = job['boxPx']
    else:
        fx0, fy0, fx1, fy1 = job.get('box', [0, 0, 1, 1])
        x0, y0, x1, y1 = round(fx0 * width), round(fy0 * height), round(fx1 * width), round(fy1 * height)
    box_w, box_h = x1 - x0, y1 - y0
    if 'ratio' not in job:
        return (x0, y0, x1, y1), None
    rw, rh = (int(part) for part in job['ratio'].split(':'))
    k = min(box_w // rw, box_h // rh)
    crop_w, crop_h = k * rw, k * rh
    fx, fy = job.get('focal', [0.5, 0.5])
    left = min(max(0, round(fx * box_w - crop_w / 2)), box_w - crop_w)
    top = min(max(0, round(fy * box_h - crop_h / 2)), box_h - crop_h)
    return (x0 + left, y0 + top, x0 + left + crop_w, y0 + top + crop_h), (rw, rh)


def output_size(crop_w, crop_h, ratio, target_w):
    if target_w >= crop_w:
        return crop_w, crop_h
    if ratio:
        rw, rh = ratio
        if target_w % rw:
            sys.exit(f'width {target_w} is not a multiple of ratio width {rw}')
        return target_w, target_w * rh // rw
    return target_w, round(target_w * crop_h / crop_w)


def encode(image, out_path, budget, start_quality):
    with tempfile.TemporaryDirectory() as tmp:
        source = os.path.join(tmp, 'source.png')
        image.save(source)
        quality = start_quality
        while True:
            subprocess.run(
                ['cwebp', '-quiet', '-q', str(quality), '-m', '6', '-sharp_yuv', '-metadata', 'none', source, '-o', out_path],
                check=True,
            )
            size = os.path.getsize(out_path)
            if size <= budget:
                return quality, size
            if quality <= MIN_QUALITY:
                sys.exit(f'{out_path}: {size} bytes still over budget {budget} at q{quality}')
            quality -= 5


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--src-dir', required=True)
    parser.add_argument('--only', nargs='*')
    args = parser.parse_args()
    if not shutil.which('cwebp'):
        sys.exit('cwebp not found: brew install webp')

    with open(os.path.join(HERE, 'jobs.json')) as handle:
        jobs = json.load(handle)
    os.makedirs(OUT_DIR, exist_ok=True)
    for job in jobs:
        if args.only and job['id'] not in args.only:
            continue
        image = ImageOps.exif_transpose(Image.open(os.path.join(args.src_dir, job['src']))).convert('RGB')
        box, ratio = crop_box(image, job)
        cropped = image.crop(box)
        size = output_size(cropped.width, cropped.height, ratio, job['width'])
        if size != cropped.size:
            cropped = cropped.resize(size, Image.Resampling.LANCZOS)
        out_path = os.path.join(OUT_DIR, f"{job['id']}.webp")
        quality, bytes_written = encode(cropped, out_path, job['budget'], job.get('quality', 82))
        print(json.dumps({'id': job['id'], 'crop': box, 'size': list(size), 'quality': quality, 'bytes': bytes_written}))


if __name__ == '__main__':
    main()
