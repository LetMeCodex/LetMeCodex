#!/usr/bin/env python3
"""
scripts/animate_pfp.py
Generates an expressive, cinematic 2-frame animated avatar of Tyler Durden.
- Frame 1: Resting pose with subtle idle smoke wisp and quiet ember.
- Frame 2: "The Hit / The Drag" — head lifts and tilts, right eye squints, cheek pulls in,
  cigarette tilts up 5°, cherry ember blazes hot with anamorphic flare and warm facial bounce,
  and thick volumetric ice-cyan smoke plumes billow up gracefully into the background.

Outputs:
- assets/avatar.gif (full square animated avatar)
- assets/avatar_circle.gif (transparent circle with glowing neon CRT border)
- assets/preview_frames.png (side-by-side frame comparison)
"""

import os
import math
import argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import cv2

def pure_screen_blend(base_img, smoke_rgba):
    """
    Applies pure Screen blend: Result = 255 - (255 - Base) * (255 - Smoke * Alpha) / 255.
    Mathematically guaranteed to NEVER darken or smudge any pixel.
    """
    base = np.array(base_img, dtype=np.float32)
    smoke = np.array(smoke_rgba, dtype=np.float32)
    
    alpha = (smoke[:, :, 3:4] / 255.0)
    rgb_s = smoke[:, :, :3] * alpha
    
    result = base + rgb_s - (base * rgb_s / 255.0)
    return Image.fromarray(np.clip(result, 0, 255).astype(np.uint8))

def create_expressive_pose(base_img):
    """
    Applies expressive head lift/tilt, eye squint, cheek suction pinch,
    and cigarette upward tilt for Frame 2.
    """
    arr = np.array(base_img).copy()
    h, w, c = arr.shape
    
    # 1. Global Head & Neck Tilt
    # Pivot at lower neck (240, 395), angle -2.4 degrees
    pivot = (240.0, 395.0)
    angle = -2.4
    M = cv2.getRotationMatrix2D(pivot, angle, 1.0)
    
    weight = np.zeros((h, w), dtype=np.float32)
    for y in range(h):
        for x in range(w):
            border_dist = min(x, w - 1 - x, y, h - 1 - y)
            border_factor = min(1.0, border_dist / 20.0)
            
            if y < 395:
                neck_factor = min(1.0, max(0.0, ((395 - y) / 370.0) ** 1.2))
            else:
                neck_factor = 0.0
                
            body_factor = 1.0 if (70 <= x <= 420) else max(0.0, 1.0 - abs(x - 245) / 180.0)
            weight[y, x] = neck_factor * border_factor * body_factor
            
    weight = cv2.GaussianBlur(weight, (35, 35), 0)
    rotated = cv2.warpAffine(arr, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    
    blended = np.zeros_like(arr, dtype=np.float32)
    for ch in range(3):
        blended[:, :, ch] = rotated[:, :, ch] * weight + arr[:, :, ch] * (1.0 - weight)
        
    # 2. Facial Expression Warps (Eye Squint + Cheek Inhale Suction)
    grid_y, grid_x = np.mgrid[0:h, 0:w].astype(np.float32)
    
    # Right Eye Squint (center ~ x=206, y=155, radius ~ 30)
    eye_cx, eye_cy = 206.0, 155.0
    eye_r = 30.0
    for dy in range(-32, 33):
        for dx in range(-32, 33):
            y = int(eye_cy + dy)
            x = int(eye_cx + dx)
            if 0 <= y < h and 0 <= x < w:
                d = math.hypot(dx, dy)
                if d < eye_r:
                    k = math.cos((d / eye_r) * (math.pi / 2.0)) ** 2
                    shift_y = 3.5 if dy < 0 else -2.2
                    grid_y[y, x] += shift_y * k

    # Cheek Inhale Suction (center ~ x=195, y=225, radius ~ 35)
    cheek_cx, cheek_cy = 195.0, 225.0
    cheek_r = 35.0
    for dy in range(-36, 37):
        for dx in range(-36, 37):
            y = int(cheek_cy + dy)
            x = int(cheek_cx + dx)
            if 0 <= y < h and 0 <= x < w:
                d = math.hypot(dx, dy)
                if d < cheek_r:
                    k = math.cos((d / cheek_r) * (math.pi / 2.0)) ** 2
                    grid_x[y, x] += -3.0 * k
                    grid_y[y, x] += 1.5 * k

    blended_warped = cv2.remap(blended.astype(np.uint8), grid_x, grid_y, interpolation=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    
    # 3. Cigarette Upward Tilt
    cig_box = (55, 190, 175, 255)
    cig_w = cig_box[2] - cig_box[0]
    cig_h = cig_box[3] - cig_box[1]
    
    cig_patch = blended_warped[cig_box[1]:cig_box[3], cig_box[0]:cig_box[2]].copy()
    box_pivot = (152 - cig_box[0], 236 - cig_box[1])
    Mcig = cv2.getRotationMatrix2D(box_pivot, -5.0, 1.0)
    rotated_cig = cv2.warpAffine(cig_patch, Mcig, (cig_w, cig_h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    
    cig_mask = np.zeros((cig_h, cig_w), dtype=np.float32)
    cv2.line(cig_mask, (95, 46), (25, 20), 1.0, thickness=13)
    cig_mask = cv2.GaussianBlur(cig_mask, (9, 9), 0)
    
    res = blended_warped.copy()
    for ch in range(3):
        res[cig_box[1]:cig_box[3], cig_box[0]:cig_box[2], ch] = (
            rotated_cig[:, :, ch] * cig_mask + 
            res[cig_box[1]:cig_box[3], cig_box[0]:cig_box[2], ch] * (1.0 - cig_mask)
        )
        
    return Image.fromarray(res)

def generate_idle_ember(w, h, tip_pos=(92, 218)):
    """Creates a subtle, quiet cherry ember for Frame 1."""
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    tx, ty = tip_pos
    draw = ImageDraw.Draw(overlay)
    
    draw.ellipse([tx - 6, ty - 6, tx + 6, ty + 6], fill=(255, 45, 0, 85))
    draw.ellipse([tx - 3, ty - 3, tx + 3, ty + 3], fill=(255, 130, 20, 190))
    draw.ellipse([tx - 1, ty - 1, tx + 1, ty + 1], fill=(255, 235, 180, 255))
    
    return overlay.filter(ImageFilter.GaussianBlur(1.2))

def generate_light_smoke(w, h, tip_pos=(92, 218)):
    """Generates a delicate idle wisp of smoke for Frame 1."""
    canvas = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    tx, ty = tip_pos
    
    pts = [
        (tx, ty - 2),
        (tx - 2, ty - 18),
        (tx + 4, ty - 38),
        (tx - 3, ty - 62),
        (tx + 6, ty - 92),
        (tx - 2, ty - 128),
        (tx + 8, ty - 168)
    ]
    for i in range(len(pts) - 1):
        p1, p2 = pts[i], pts[i+1]
        t = i / (len(pts) - 1)
        width = int(2 + t * 6)
        alpha = int(115 * (1.0 - t * 0.75))
        draw.line([p1, p2], fill=(175, 235, 255, alpha), width=width)
        r = width // 2
        draw.ellipse([p2[0] - r, p2[1] - r, p2[0] + r, p2[1] + r], fill=(185, 240, 255, alpha))
        
    return canvas.filter(ImageFilter.GaussianBlur(2.4))

def generate_blazing_ember(w, h, tip_pos=(98, 208)):
    """
    Creates an incandescent cherry ember with smooth Gaussian bloom,
    warm face bounce, and anamorphic flare for Frame 2.
    """
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    tx, ty = tip_pos
    
    # 1. Warm face bounce illumination (lips, chin, jaw)
    face_glow = np.zeros((h, w, 4), dtype=np.float32)
    for y in range(max(0, ty - 70), min(h, ty + 100)):
        for x in range(max(0, tx - 10), min(w, tx + 140)):
            d = math.hypot(x - tx, y - ty)
            if d < 130:
                intensity = math.exp(-0.5 * (d / 42.0) ** 2)
                face_glow[y, x, 0] = 255
                face_glow[y, x, 1] = 130
                face_glow[y, x, 2] = 35
                face_glow[y, x, 3] = intensity * 100
                
    face_img = Image.fromarray(face_glow.astype(np.uint8), mode='RGBA').filter(ImageFilter.GaussianBlur(14.0))
    overlay.alpha_composite(face_img)
    
    # 2. Glowing outer bloom
    ember_layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(ember_layer)
    draw.ellipse([tx - 30, ty - 30, tx + 30, ty + 30], fill=(255, 35, 0, 105))
    draw.ellipse([tx - 16, ty - 16, tx + 16, ty + 16], fill=(255, 115, 15, 195))
    draw.ellipse([tx - 9, ty - 9, tx + 9, ty + 9], fill=(255, 215, 45, 240))
    ember_layer = ember_layer.filter(ImageFilter.GaussianBlur(7.0))
    overlay.alpha_composite(ember_layer)
    
    # 3. Super hot white core + tight golden halo
    core_layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw_c = ImageDraw.Draw(core_layer)
    draw_c.ellipse([tx - 6, ty - 6, tx + 6, ty + 6], fill=(255, 240, 130, 255))
    draw_c.ellipse([tx - 3, ty - 3, tx + 3, ty + 3], fill=(255, 255, 255, 255))
    
    # Horizontal cinematic anamorphic streak
    draw_c.line([tx - 30, ty, tx + 30, ty], fill=(255, 240, 180, 160), width=2)
    draw_c.line([tx - 14, ty, tx + 14, ty], fill=(255, 255, 255, 255), width=2)
    
    core_layer = core_layer.filter(ImageFilter.GaussianBlur(1.0))
    overlay.alpha_composite(core_layer)
    
    return overlay

def generate_dense_volumetric_smoke(w, h, tip_pos=(98, 208)):
    """
    Generates rich, heavy, billowing cigarette smoke with:
    - Multiple billowing cloud volumes (volumetric body)
    - 3 distinct serpentine twisting ribbons
    - Exhale wisp from lips
    - Luminous core filaments
    - Pure ethereal ice-cyan / phosphor white color
    """
    tx, ty = tip_pos
    
    # 1. Soft billowing cloud bodies
    clouds_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw_c = ImageDraw.Draw(clouds_img)
    
    cloud_clusters = [
        # Immediate plume off tip
        (tx - 2, ty - 12, 14, 200),
        (tx - 8, ty - 26, 18, 190),
        (tx - 16, ty - 45, 24, 180),
        (tx - 12, ty - 68, 30, 170),
        (tx - 25, ty - 95, 36, 160),
        (tx - 18, ty - 125, 42, 150),
        (tx - 32, ty - 158, 48, 135),
        (tx - 22, ty - 192, 54, 110),
        
        # Left vortex curling into negative space
        (tx - 28, ty - 48, 20, 160),
        (tx - 42, ty - 75, 26, 145),
        (tx - 48, ty - 110, 32, 130),
        (tx - 40, ty - 148, 38, 115),
        (tx - 52, ty - 185, 44, 95),
        
        # Right drift passing temple and hair
        (tx + 12, ty - 32, 16, 160),
        (tx + 22, ty - 60, 22, 140),
        (tx + 28, ty - 92, 28, 120),
        (tx + 36, ty - 130, 34, 100),
        (tx + 30, ty - 170, 40, 85),
        
        # Vapor escaping lips
        (148, 234, 10, 180),
        (140, 220, 14, 160),
        (132, 202, 18, 140),
        (128, 178, 22, 120),
    ]
    
    for cx, cy, cr, calpha in cloud_clusters:
        draw_c.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=(210, 245, 255, calpha))
        
    clouds_blur = clouds_img.filter(ImageFilter.GaussianBlur(8.5))
    
    # 2. Defined curling ribbon tendrils
    ribbon_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw_r = ImageDraw.Draw(ribbon_img)
    
    # Main Spine (S-curve)
    spine_pts = [
        (tx, ty - 2),
        (tx - 6, ty - 20),
        (tx - 18, ty - 42),
        (tx - 10, ty - 70),
        (tx - 26, ty - 102),
        (tx - 15, ty - 138),
        (tx - 34, ty - 175),
        (tx - 20, ty - 212)
    ]
    for i in range(len(spine_pts) - 1):
        p1, p2 = spine_pts[i], spine_pts[i+1]
        t = i / (len(spine_pts) - 1)
        width = int(5 + t * 22)
        alpha = int(225 * (1.0 - t * 0.55))
        draw_r.line([p1, p2], fill=(225, 248, 255, alpha), width=width)
        r = width // 2
        draw_r.ellipse([p2[0] - r, p2[1] - r, p2[0] + r, p2[1] + r], fill=(230, 250, 255, alpha))

    # Left looping plume
    left_pts = [
        (tx - 8, ty - 25),
        (tx - 24, ty - 46),
        (tx - 40, ty - 74),
        (tx - 42, ty - 108),
        (tx - 30, ty - 142),
        (tx - 48, ty - 178)
    ]
    for i in range(len(left_pts) - 1):
        p1, p2 = left_pts[i], left_pts[i+1]
        t = i / (len(left_pts) - 1)
        width = int(4 + t * 16)
        alpha = int(190 * (1.0 - t * 0.6))
        draw_r.line([p1, p2], fill=(200, 240, 255, alpha), width=width)
        r = width // 2
        draw_r.ellipse([p2[0] - r, p2[1] - r, p2[0] + r, p2[1] + r], fill=(210, 245, 255, alpha))

    # Right cheek/hair drift
    right_pts = [
        (tx + 4, ty - 16),
        (tx + 16, ty - 40),
        (tx + 26, ty - 72),
        (tx + 22, ty - 110),
        (tx + 36, ty - 152),
        (tx + 28, ty - 192)
    ]
    for i in range(len(right_pts) - 1):
        p1, p2 = right_pts[i], right_pts[i+1]
        t = i / (len(right_pts) - 1)
        width = int(3 + t * 12)
        alpha = int(170 * (1.0 - t * 0.68))
        draw_r.line([p1, p2], fill=(205, 242, 255, alpha), width=width)
        r = width // 2
        draw_r.ellipse([p2[0] - r, p2[1] - r, p2[0] + r, p2[1] + r], fill=(215, 245, 255, alpha))

    # Exhale from mouth
    mouth_pts = [
        (148, 234),
        (138, 216),
        (128, 194),
        (134, 168),
        (120, 138)
    ]
    for i in range(len(mouth_pts) - 1):
        p1, p2 = mouth_pts[i], mouth_pts[i+1]
        t = i / (len(mouth_pts) - 1)
        width = int(3 + t * 9)
        alpha = int(160 * (1.0 - t * 0.72))
        draw_r.line([p1, p2], fill=(215, 245, 255, alpha), width=width)

    ribbon_blur = ribbon_img.filter(ImageFilter.GaussianBlur(3.4))
    
    # 3. Luminous silky highlights
    high_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw_h = ImageDraw.Draw(high_img)
    for i in range(len(spine_pts) - 2):
        p1, p2 = spine_pts[i], spine_pts[i+1]
        t = i / (len(spine_pts) - 1)
        draw_h.line([p1, p2], fill=(255, 255, 255, int(230 * (1.0 - t * 0.65))), width=3)
    for i in range(len(left_pts) - 2):
        p1, p2 = left_pts[i], left_pts[i+1]
        t = i / (len(left_pts) - 1)
        draw_h.line([p1, p2], fill=(245, 255, 255, int(190 * (1.0 - t * 0.7))), width=2)
    high_blur = high_img.filter(ImageFilter.GaussianBlur(1.3))
    
    total = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    total.alpha_composite(clouds_blur)
    total.alpha_composite(ribbon_blur)
    total.alpha_composite(high_blur)
    return total

def generate_animated_avatar(input_path, output_path, duration=330):
    """
    Builds the animated GIF from the input avatar image.
    Generates both square GIF and transparent circular GIF for GitHub Profile README.
    """
    print(f"Loading source avatar from: {input_path}")
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input image not found: {input_path}")
        
    base = Image.open(input_path).convert('RGB')
    w, h = base.size
    print(f"Image dimensions: {w}x{h}")
    
    # --- Frame 1: Resting Pose ---
    f1_smoke = generate_light_smoke(w, h, tip_pos=(92, 218))
    f1_ember = generate_idle_ember(w, h, tip_pos=(92, 218))
    f1_screen = pure_screen_blend(base, f1_smoke)
    f1_rgba = f1_screen.convert('RGBA')
    f1_rgba.alpha_composite(f1_ember)
    f1 = f1_rgba.convert('RGB')
    
    # --- Frame 2: The Drag & Puff ---
    f2_base = create_expressive_pose(base)
    f2_smoke = generate_dense_volumetric_smoke(w, h, tip_pos=(98, 208))
    f2_ember = generate_blazing_ember(w, h, tip_pos=(98, 208))
    f2_screen = pure_screen_blend(f2_base, f2_smoke)
    f2_rgba = f2_screen.convert('RGBA')
    f2_rgba.alpha_composite(f2_ember)
    f2 = f2_rgba.convert('RGB')
    
    frames = [f1, f2]
    
    # 1. Save Full Square Animated Avatar
    print(f"Assembling 2 frames into square animated GIF (duration={duration}ms, loop=0)...")
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
        optimize=True
    )
    filesize_kb = os.path.getsize(output_path) / 1024.0
    print(f"Successfully saved animated avatar to: {output_path} ({filesize_kb:.1f} KB)")
    
    # 2. Save Side-by-side Preview Frame comparison
    preview_path = os.path.join(os.path.dirname(output_path), 'preview_frames.png')
    comparison = Image.new('RGB', (w * 2, h))
    comparison.paste(f1, (0, 0))
    comparison.paste(f2, (w, 0))
    comparison.save(preview_path)
    print(f"Saved side-by-side frame comparison to: {preview_path}")

    # 3. Save Circular Transparent Avatar with Neon CRT Cyan Ring
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
        # Subtle CRT neon ring pulse between frames
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
    circle_size_kb = os.path.getsize(circle_path) / 1024.0
    print(f"Successfully saved transparent circular animated avatar to: {circle_path} ({circle_size_kb:.1f} KB)")

def main():
    parser = argparse.ArgumentParser(description="Generate animated GitHub PFP")
    parser.add_argument('--input', '-i', default='assets/current_pfp.png', help='Path to source avatar image')
    parser.add_argument('--output', '-o', default='assets/avatar.gif', help='Path to output animated GIF')
    parser.add_argument('--duration', '-d', type=int, default=330, help='Frame duration in milliseconds (default: 330)')
    
    args = parser.parse_args()
    
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    in_path = os.path.join(project_root, args.input) if not os.path.isabs(args.input) else args.input
    out_path = os.path.join(project_root, args.output) if not os.path.isabs(args.output) else args.output
    
    generate_animated_avatar(in_path, out_path, duration=args.duration)

if __name__ == '__main__':
    main()
