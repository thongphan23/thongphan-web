#!/usr/bin/env python3
"""Blur the audience (or the whole background) of a stage photo while keeping the speaker sharp.
Requires Pillow and numpy.

Usage:
  python3 scripts/photos/blur-audience.py SRC SPEAKER_MASK OUT [--faces FACES.json]
      [--band TOP,BOTTOM] [--zone X0,Y0,X1,Y1 ...] [--radius FRACTION] [--grow PX] [--preview PREVIEW.jpg]

Coordinates are fractions of the image size. The band is a full-width strip with feathered edges;
zones are extra feathered rectangles (for example a foreground plant). The speaker mask (from
person-mask.swift) is subtracted from both. Faces detected outside the blurred area get a soft
elliptical blur; faces already inside it or touching the speaker are left alone.
Always open the preview and check every face by eye before exporting.
"""
import argparse
import json

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps


def fractions(count):
    def parse(text):
        values = [float(value) for value in text.split(',')]
        if len(values) != count or not all(0 <= value <= 1 for value in values):
            raise argparse.ArgumentTypeError(f'expected {count} fractions in [0,1]: {text}')
        return values

    return parse


def background_blur(image, speaker, radius):
    """Gaussian blur that ignores the speaker's pixels, so no dark halo bleeds into the background."""
    keep = ImageOps.invert(speaker)
    weights = np.asarray(keep.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32)[..., None]
    premultiplied = Image.composite(image, Image.new('RGB', image.size), keep)
    summed = np.asarray(premultiplied.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32)
    plain = np.asarray(image.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32)
    normalised = np.where(weights > 8, summed * 255 / np.maximum(weights, 1), plain)
    return Image.fromarray(np.clip(normalised, 0, 255).astype(np.uint8))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('src')
    parser.add_argument('speaker_mask')
    parser.add_argument('out')
    parser.add_argument('--faces', help='JSON from detect-faces.swift')
    parser.add_argument('--band', type=fractions(2), default=[0.34, 0.84])
    parser.add_argument('--zone', type=fractions(4), action='append', default=[])
    parser.add_argument('--radius', type=float, default=0.0055, help='blur radius as a fraction of image width')
    parser.add_argument('--grow', type=int, default=15, help='odd pixel size the speaker mask is dilated by (protects hair)')
    parser.add_argument('--preview', help='also write a 1600px JPEG for review')
    args = parser.parse_args()

    image = ImageOps.exif_transpose(Image.open(args.src)).convert('RGB')
    width, height = image.size

    area = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(area)
    top, bottom = args.band
    if bottom > top:
        draw.rectangle([0, int(top * height), width, int(bottom * height)], fill=255)
    for x0, y0, x1, y1 in args.zone:
        draw.rectangle([int(x0 * width), int(y0 * height), int(x1 * width), int(y1 * height)], fill=255)
    area = area.filter(ImageFilter.GaussianBlur(max(2, int(0.02 * height))))

    speaker = Image.open(args.speaker_mask).convert('L').resize((width, height))
    speaker = speaker.point(lambda value: 255 if value > 100 else 0)
    speaker = speaker.filter(ImageFilter.MaxFilter(args.grow)).filter(ImageFilter.GaussianBlur(max(2, args.grow // 2 - 1)))

    mask = ImageChops.subtract(area, speaker)
    image = Image.composite(background_blur(image, speaker, max(2, int(args.radius * width))), image, mask)

    softened = skipped = 0
    if args.faces:
        with open(args.faces) as handle:
            faces = json.load(handle)['faces']
        pad = 0.45
        for face in faces:
            x0 = max(0, int(face['x'] - face['w'] * pad))
            y0 = max(0, int(face['y'] - face['h'] * pad))
            x1 = min(width, int(face['x'] + face['w'] * (1 + pad)))
            y1 = min(height, int(face['y'] + face['h'] * (1 + pad)))
            centre = (min(width - 1, int(face['x'] + face['w'] / 2)), min(height - 1, int(face['y'] + face['h'] / 2)))
            # Never blur the speaker's own head; faces already inside the blurred area need nothing more.
            if speaker.crop((x0, y0, x1, y1)).getextrema()[1] > 200 or mask.getpixel(centre) > 200:
                skipped += 1
                continue
            patch = image.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(max(6, int((x1 - x0) / 5))))
            ellipse = Image.new('L', patch.size, 0)
            ImageDraw.Draw(ellipse).ellipse([0, 0, patch.size[0] - 1, patch.size[1] - 1], fill=255)
            image.paste(patch, (x0, y0), ellipse.filter(ImageFilter.GaussianBlur(4)))
            softened += 1

    image.save(args.out, quality=95)
    if args.preview:
        preview = image.copy()
        preview.thumbnail((1600, 1600))
        preview.save(args.preview, quality=85)
    print(json.dumps({'out': args.out, 'size': [width, height], 'facesSoftened': softened, 'facesSkipped': skipped}))


if __name__ == '__main__':
    main()
