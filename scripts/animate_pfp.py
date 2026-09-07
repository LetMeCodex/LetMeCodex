#!/usr/bin/env python3
"""
scripts/animate_pfp.py
Generates the official 2-frame animated avatar from the user's two authentic Tyler Durden portraits:
- Frame 1: Side profile (looking left with cigarette)
- Frame 2: Front 3/4 gaze (turned towards the viewer with lit cherry and rising smoke)

Produces:
- assets/avatar.gif (Full square 460x460 animated avatar)
- assets/avatar_circle.gif (Circular transparent avatar with pulsing neon CRT ring for GitHub Profile README)
- assets/preview_frames.png (Side-by-side frame comparison)
"""

import os
import argparse
import numpy as np
from PIL import Image, ImageDraw, ImageSequence

def build_dual_frame_avatar(
    frame1_path='assets/pfp_frame1.png',
    frame2_path='assets/pfp_frame2.jpg',
    output_dir='assets',
    duration=600
):
    print(f"Loading Frame 1 from: {frame1_path}")
    print(f"Loading Frame 2 from: {frame2_path}")
    
    if not os.path.exists(frame1_path):
        raise FileNotFoundError(f"Frame 1 not found: {frame1_path}")
    if not os.path.exists(frame2_path):
        raise FileNotFoundError(f"Frame 2 not found: {frame2_path}")
        
    im1 = Image.open(frame1_path).convert('RGB')
    im2 = Image.open(frame2_path).convert('RGB')
    
    w, h = 460, 460
    im1 = im1.resize((w, h), Image.Resampling.LANCZOS)
    im2 = im2.resize((w, h), Image.Resampling.LANCZOS)
    
    frames = [im1, im2]
    
    # 1. Save side-by-side comparison for preview
    preview_path = os.path.join(output_dir, 'preview_frames.png')
    comparison = Image.new('RGB', (w * 2, h))
    comparison.paste(im1, (0, 0))
    comparison.paste(im2, (w, 0))
    comparison.save(preview_path)
    print(f"Saved side-by-side comparison to: {preview_path}")
    
    # 2. Save Full Square Animated Avatar (avatar.gif)
    square_path = os.path.join(output_dir, 'avatar.gif')
    
    # Quantize each frame with adaptive 256-color palette for crisp CRT scanlines
    q_frames = []
    for f in frames:
        # Convert RGB to P using Floyd-Steinberg dithering for smooth gradients
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
    square_size_kb = os.path.getsize(square_path) / 1024.0
    print(f"Saved square animated avatar to: {square_path} ({square_size_kb:.1f} KB)")
    
    # 3. Save Circular Transparent Avatar with Neon CRT Ring (avatar_circle.gif)
    circle_path = os.path.join(output_dir, 'avatar_circle.gif')
    cx, cy = w // 2, h // 2
    radius = min(w, h) // 2 - 4  # 226px radius
    
    # Circular mask
    mask = Image.new('L', (w, h), 0)
    draw_m = ImageDraw.Draw(mask)
    draw_m.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=255)
    
    circle_frames = []
    for idx, f in enumerate(frames):
        rgba = f.convert('RGBA')
        transparent = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        cropped = Image.composite(rgba, transparent, mask)
        
        # Draw sleek Linear/Apple minimal hairline titanium bezel
        draw = ImageDraw.Draw(cropped)
        # Subtle brushed titanium / frosted platinum hairline border (crisp and minimal)
        border_color = (210, 215, 225, 150) if idx == 0 else (235, 240, 250, 190)
        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=border_color, width=2)
        circle_frames.append(cropped)
        
    # Convert RGBA circular frames to GIF with transparent color index
    gif_circle_frames = []
    for f in circle_frames:
        alpha = f.split()[-1]
        # Quantize RGB channels with 255 colors (leave slot 255 for transparency)
        p_img = f.convert('RGB').quantize(colors=255, method=Image.Resampling.LANCZOS, dither=Image.Dither.FLOYDSTEINBERG)
        
        # Find pixels that should be transparent
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
    circle_size_kb = os.path.getsize(circle_path) / 1024.0
    print(f"Saved circular transparent avatar to: {circle_path} ({circle_size_kb:.1f} KB)")

def main():
    parser = argparse.ArgumentParser(description="Generate 2-frame animated GitHub avatar")
    parser.add_argument('--frame1', '-1', default='assets/pfp_frame1.png', help='Path to Frame 1 (side profile)')
    parser.add_argument('--frame2', '-2', default='assets/pfp_frame2.jpg', help='Path to Frame 2 (front gaze)')
    parser.add_argument('--output-dir', '-o', default='assets', help='Output directory')
    parser.add_argument('--duration', '-d', type=int, default=580, help='Frame duration in milliseconds (default: 580ms)')
    
    args = parser.parse_args()
    
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    f1 = os.path.join(project_root, args.frame1) if not os.path.isabs(args.frame1) else args.frame1
    f2 = os.path.join(project_root, args.frame2) if not os.path.isabs(args.frame2) else args.frame2
    out = os.path.join(project_root, args.output_dir) if not os.path.isabs(args.output_dir) else args.output_dir
    
    build_dual_frame_avatar(f1, f2, out, duration=args.duration)

if __name__ == '__main__':
    main()
