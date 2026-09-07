#!/usr/bin/env python3
"""
scripts/animate_oppenheimer.py
Generates the official 2-frame animated Oppenheimer nuclear beach avatar:
- Frame 1: Initial detonation, dense core fireball, blazing ocean reflection
- Frame 2: Stratospheric mushroom expansion, condensation shockwave ring, turbulent billowing smoke

Produces:
- assets/oppenheimer/oppenheimer_frame1.png (Cleaned 460x460 Frame 1)
- assets/oppenheimer/oppenheimer_frame2.png (Aligned 460x460 Frame 2)
- assets/oppenheimer/preview_frames.png (Side-by-side comparison)
- assets/oppenheimer/avatar.gif (Full square 460x460 animated avatar)
- assets/oppenheimer/avatar_circle.gif (Circular transparent avatar with amber hairline titanium ring)
"""

import os
import argparse
import numpy as np
from PIL import Image, ImageDraw

def build_oppenheimer_avatar(
    frame1_path='assets/oppenheimer/oppenheimer_frame1.png',
    frame2_path='assets/oppenheimer/oppenheimer_frame2.png',
    output_dir='assets/oppenheimer',
    duration=580
):
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Loading Frame 1 from: {frame1_path}")
    print(f"Loading Frame 2 from: {frame2_path}")
    
    im1 = Image.open(frame1_path).convert('RGB')
    im2 = Image.open(frame2_path).convert('RGB')
    
    w, h = 460, 460
    im1 = im1.resize((w, h), Image.Resampling.LANCZOS)
    im2 = im2.resize((w, h), Image.Resampling.LANCZOS)
    
    frames = [im1, im2]
    
    # 1. Save side-by-side comparison
    preview_path = os.path.join(output_dir, 'preview_frames.png')
    comparison = Image.new('RGB', (w * 2, h))
    comparison.paste(im1, (0, 0))
    comparison.paste(im2, (w, 0))
    comparison.save(preview_path)
    print(f"Saved side-by-side comparison to: {preview_path}")
    
    # 2. Square animated avatar (avatar.gif)
    square_path = os.path.join(output_dir, 'avatar.gif')
    q_frames = []
    for f in frames:
        q = f.quantize(colors=256, method=Image.Resampling.LANCZOS, dither=Image.Dither.FLOYDSTEINBERG)
        q_frames.append(q)
        
    q_frames[0].save(
        square_path,
        save_all=True,
        append_images=q_frames[1:],
        duration=duration,
        loop=0,
        disposal=2,
        optimize=True
    )
    square_kb = os.path.getsize(square_path) / 1024.0
    print(f"Saved square animated avatar to: {square_path} ({square_kb:.1f} KB)")
    
    # 3. Circular transparent avatar with amber hairline titanium ring
    circle_path = os.path.join(output_dir, 'avatar_circle.gif')
    cx, cy = w // 2, h // 2
    radius = min(w, h) // 2 - 4
    
    mask = Image.new('L', (w, h), 0)
    draw_m = ImageDraw.Draw(mask)
    draw_m.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=255)
    
    circle_frames = []
    for idx, f in enumerate(frames):
        rgba = f.convert('RGBA')
        transparent = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        cropped = Image.composite(rgba, transparent, mask)
        draw = ImageDraw.Draw(cropped)
        border_color = (255, 180, 120, 160) if idx == 0 else (255, 220, 170, 210)
        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=border_color, width=2)
        circle_frames.append(cropped)
        
    gif_circle_frames = []
    for f in circle_frames:
        alpha = f.split()[-1]
        p_img = f.convert('RGB').quantize(colors=255, method=Image.Resampling.LANCZOS, dither=Image.Dither.FLOYDSTEINBERG)
        mask_arr = np.array(alpha) < 128
        p_arr = np.array(p_img)
        p_arr[mask_arr] = 255
        new_p = Image.fromarray(p_arr, mode='P')
        pal = list(p_img.getpalette())[:765] + [0, 0, 0]
        new_p.putpalette(pal)
        new_p.info['transparency'] = 255
        new_p.info['duration'] = duration
        new_p.info['disposal'] = 2
        gif_circle_frames.append(new_p)
        
    gif_circle_frames[0].save(
        circle_path,
        save_all=True,
        append_images=gif_circle_frames[1:],
        duration=duration,
        loop=0,
        transparency=255,
        disposal=2,
        optimize=False
    )
    circle_kb = os.path.getsize(circle_path) / 1024.0
    print(f"Saved circular transparent avatar to: {circle_path} ({circle_kb:.1f} KB)")

def main():
    parser = argparse.ArgumentParser(description="Generate 2-frame Oppenheimer animated avatar")
    parser.add_argument('--frame1', '-1', default='assets/oppenheimer/oppenheimer_frame1.png')
    parser.add_argument('--frame2', '-2', default='assets/oppenheimer/oppenheimer_frame2.png')
    parser.add_argument('--output-dir', '-o', default='assets/oppenheimer')
    parser.add_argument('--duration', '-d', type=int, default=580)
    args = parser.parse_args()
    build_oppenheimer_avatar(args.frame1, args.frame2, args.output_dir, args.duration)

if __name__ == '__main__':
    main()
