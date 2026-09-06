#!/usr/bin/env python3
"""
scripts/animate_pfp.py
Generates an animated CRT / Glitch / Cigarette Smoke GIF avatar from your GitHub profile picture.
Produces a 2-frame (or multi-frame) looping GIF ready to upload to GitHub Profile Settings.
"""

import os
import sys
import argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def create_smoke_layer(w, h, frame_idx=0, total_frames=2):
    """Generates an organic curling smoke plume rising from the cigarette tip."""
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Cigarette tip origin at (92, 218)
    tip_x, tip_y = 92, 218
    
    if frame_idx == 0:
        pts = [
            (tip_x, tip_y - 1),
            (tip_x - 3, tip_y - 16),
            (tip_x + 1, tip_y - 34),
            (tip_x - 5, tip_y - 52),
            (tip_x + 2, tip_y - 72),
            (tip_x - 6, tip_y - 92)
        ]
    else:
        pts = [
            (tip_x, tip_y - 1),
            (tip_x + 3, tip_y - 18),
            (tip_x - 2, tip_y - 36),
            (tip_x + 4, tip_y - 56),
            (tip_x - 3, tip_y - 76),
            (tip_x + 3, tip_y - 98)
        ]
        
    for i in range(len(pts) - 1):
        p1 = pts[i]
        p2 = pts[i + 1]
        progress = i / (len(pts) - 1)
        width = int(2 + progress * 7)
        alpha = int(145 * (1.0 - progress * 0.82))
        
        # Cyan-tinted smoke matching the avatar color grading
        draw.line([p1, p2], fill=(170, 230, 255, alpha), width=width)
        draw.ellipse([p2[0] - width // 2, p2[1] - width // 2, p2[0] + width // 2, p2[1] + width // 2], fill=(170, 230, 255, alpha))
        
    return overlay.filter(ImageFilter.GaussianBlur(1.8))

def create_ember_layer(w, h, is_flaring=False):
    """Generates glowing incandescent cigarette cherry ember."""
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    cx, cy = 92, 218
    
    if not is_flaring:
        # Idle warm cherry
        draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(255, 75, 15, 80))
        draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(255, 140, 30, 190))
        draw.ellipse([cx - 1, cy - 1, cx + 1, cy + 1], fill=(255, 245, 200, 255))
    else:
        # Active bright puff / flare
        draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(255, 60, 0, 130))
        draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(255, 120, 20, 195))
        draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(255, 205, 50, 235))
        draw.ellipse([cx - 1, cy - 1, cx + 1, cy + 1], fill=(255, 255, 255, 255))
        
    return overlay.filter(ImageFilter.GaussianBlur(0.8))

def apply_crt_glitch(img_rgb, frame_idx=1):
    """Applies authentic CRT monitor interlacing, chromatic aberration, and scanline jitter."""
    arr = np.array(img_rgb, dtype=np.float32)
    h, w, _ = arr.shape
    
    if frame_idx == 0:
        # Frame 1: subtle baseline interlacing
        for y in range(h):
            if y % 2 == 0:
                arr[y] *= 1.02
            else:
                arr[y] *= 0.98
    else:
        # Frame 2: CRT sync pulse, chromatic aberration & scanline jitter
        # 1. Chromatic aberration (RGB channel split)
        arr_r = np.roll(arr[:, :, 0], -1, axis=1)
        arr_b = np.roll(arr[:, :, 2], 1, axis=1)
        arr[:, :, 0] = arr_r
        arr[:, :, 2] = arr_b
        
        # 2. Inverted interlace phase
        for y in range(h):
            if y % 2 == 0:
                arr[y] *= 0.97
            else:
                arr[y] *= 1.03
                
        # 3. Two subtle analog VHS scanline displacement slices
        slice1_y, slice1_h = 135, 8
        arr[slice1_y:slice1_y + slice1_h] = np.roll(arr[slice1_y:slice1_y + slice1_h], 3, axis=1)
        
        slice2_y, slice2_h = 310, 10
        arr[slice2_y:slice2_y + slice2_h] = np.roll(arr[slice2_y:slice2_y + slice2_h], -2, axis=1)
        
    return Image.fromarray(np.uint8(np.clip(arr, 0, 255)))

def generate_animated_avatar(input_path, output_path, mode='all', duration=260, num_frames=2):
    """Builds the animated GIF from the input avatar image."""
    print(f"Loading source avatar from: {input_path}")
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input image not found: {input_path}")
        
    base = Image.open(input_path).convert('RGB')
    w, h = base.size
    print(f"Image dimensions: {w}x{h}")
    
    frames = []
    
    for f in range(num_frames):
        # Base image with optional CRT effect
        if mode in ('all', 'glitch', 'subtle'):
            frame_img = apply_crt_glitch(base, frame_idx=f)
        else:
            frame_img = base.copy()
            
        frame_rgba = frame_img.convert('RGBA')
        
        # Apply cigarette smoke and glowing ember
        if mode in ('all', 'smoke', 'subtle'):
            smoke = create_smoke_layer(w, h, frame_idx=f, total_frames=num_frames)
            ember = create_ember_layer(w, h, is_flaring=(f % 2 == 1))
            frame_rgba.alpha_composite(smoke)
            frame_rgba.alpha_composite(ember)
            
        frames.append(frame_rgba.convert('RGB'))
        
    print(f"Assembling {len(frames)} frames into animated GIF (duration={duration}ms, loop=0)...")
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
        optimize=True
    )
    
    filesize_kb = os.path.getsize(output_path) / 1024.0
    print(f"Successfully saved animated avatar to: {output_path}")
    print(f"File size: {filesize_kb:.1f} KB")

    # Also generate circular avatar with CRT neon border ring for Profile README
    circle_path = os.path.join(os.path.dirname(output_path), 'avatar_circle.gif')
    cx, cy = w // 2, h // 2
    radius = min(w, h) // 2 - 4
    mask = Image.new('L', (w, h), 0)
    draw_m = ImageDraw.Draw(mask)
    draw_m.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=255)

    circle_frames = []
    for idx, f in enumerate(frames):
        transparent_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        cropped = Image.composite(f.convert('RGBA'), transparent_img, mask)
        draw = ImageDraw.Draw(cropped)
        accent = (20, 184, 166, 255) if idx == 0 else (56, 189, 248, 255)
        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=accent, width=3)
        circle_frames.append(cropped)

    gif_frames = []
    for f in circle_frames:
        alpha = f.split()[-1]
        p_img = f.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=255)
        mask_arr = np.array(alpha) < 128
        p_arr = np.array(p_img)
        p_arr[mask_arr] = 255
        new_p = Image.fromarray(p_arr, mode='P')
        pal = list(p_img.getpalette())[:765] + [0, 0, 0]
        new_p.putpalette(pal)
        new_p.info['transparency'] = 255
        gif_frames.append(new_p)

    gif_frames[0].save(
        circle_path,
        save_all=True,
        append_images=gif_frames[1:],
        duration=duration,
        loop=0,
        transparency=255,
        disposal=2,
        optimize=True
    )
    print(f"Successfully saved transparent circular animated avatar to: {circle_path} ({os.path.getsize(circle_path)/1024.0:.1f} KB)")

def main():
    parser = argparse.ArgumentParser(description="Generate an animated GitHub PFP")
    parser.add_argument('--input', '-i', default='assets/current_pfp.png', help='Path to source avatar image')
    parser.add_argument('--output', '-o', default='assets/avatar.gif', help='Path to output animated GIF')
    parser.add_argument('--mode', '-m', choices=['all', 'glitch', 'smoke', 'subtle'], default='all', help='Animation mode')
    parser.add_argument('--duration', '-d', type=int, default=260, help='Frame duration in milliseconds (default: 260)')
    parser.add_argument('--frames', '-f', type=int, default=2, help='Number of frames (default: 2)')
    
    args = parser.parse_args()
    
    # Resolve paths relative to project root
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    in_path = os.path.join(project_root, args.input) if not os.path.isabs(args.input) else args.input
    out_path = os.path.join(project_root, args.output) if not os.path.isabs(args.output) else args.output
    
    generate_animated_avatar(in_path, out_path, mode=args.mode, duration=args.duration, num_frames=args.frames)

if __name__ == '__main__':
    main()
