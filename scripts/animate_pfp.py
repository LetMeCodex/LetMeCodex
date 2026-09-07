#!/usr/bin/env python3
"""
scripts/animate_pfp.py
Generates a smooth, fluid cinematic animation of Tyler Durden between:
- Frame 1: Original PFP (resting pose, cigarette in mouth, looking sideways)
- Frame 2: Uploaded sister pose (hand raises to jaw holding cigarette, intense forward gaze, smoking)

Supports:
- Fluid mode: Dense optical flow morphing + smooth hand entry interpolation (14-16 seamless frames)
- Cut mode: Direct 2-frame punchy jump cut

Outputs:
- assets/avatar.gif (full square fluid animated avatar)
- assets/avatar_circle.gif (transparent circle with glowing CRT neon cyan border)
- assets/avatar_2frame.gif (direct 2-frame cut version)
- assets/preview_frames.png (side-by-side comparison of the two keyframes)
"""

import os
import argparse
import numpy as np
import cv2
from PIL import Image, ImageDraw

def compute_fluid_sequence(img1_bgr, img2_bgr, transition_steps=5, hold_frames=3):
    """
    Computes a seamless, fluid animation sequence transitioning between
    Frame 1 and Frame 2 using bidirectional optical flow and vertical hand motion.
    """
    h, w = img1_bgr.shape[:2]
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    
    gray1 = cv2.cvtColor(img1_bgr, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2_bgr, cv2.COLOR_BGR2GRAY)
    
    # Dense optical flow using DIS algorithm
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    f_01 = dis.calc(gray1, gray2, None)
    f_10 = dis.calc(gray2, gray1, None)
    
    # Extract hand mask from Frame 2
    diff = cv2.absdiff(img1_bgr, img2_bgr)
    gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
    hand_mask = np.zeros((h, w), dtype=np.float32)
    for y in range(210, 420):
        for x in range(80, 230):
            if gray_diff[y, x] > 25:
                hand_mask[y, x] = min(1.0, (gray_diff[y, x] - 25) / 60.0)
    hand_mask = cv2.GaussianBlur(hand_mask, (15, 15), 0)
    
    def morph_background_and_face(t):
        map0_x = (grid_x + t * f_10[:, :, 0]).astype(np.float32)
        map0_y = (grid_y + t * f_10[:, :, 1]).astype(np.float32)
        w0 = cv2.remap(img1_bgr, map0_x, map0_y, interpolation=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        
        map1_x = (grid_x + (1.0 - t) * f_01[:, :, 0]).astype(np.float32)
        map1_y = (grid_y + (1.0 - t) * f_01[:, :, 1]).astype(np.float32)
        w1 = cv2.remap(img2_bgr, map1_x, map1_y, interpolation=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        
        return cv2.addWeighted(w0, 1.0 - t, w1, t, 0)

    def render_fluid_frame(t):
        # Cosine ease-in-out curve for natural physical acceleration
        ease_t = float(0.5 - 0.5 * np.cos(t * np.pi))
        
        # 1. Morph face, eyes, hair, and CRT scanlines
        base_morph = morph_background_and_face(ease_t)
        
        # 2. Hand entry motion: hand moves smoothly up from bottom chest into jaw
        dy = int(65.0 * (1.0 - ease_t))
        dx = int(12.0 * (1.0 - ease_t))
        M = np.float32([[1, 0, -dx], [0, 1, dy]])
        warped_hand = cv2.warpAffine(img2_bgr, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        warped_mask = cv2.warpAffine(hand_mask, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
        
        # Alpha fades in as hand moves into place
        alpha = (warped_mask * (ease_t ** 0.7))[:, :, np.newaxis]
        combined = (base_morph * (1.0 - alpha) + warped_hand * alpha).astype(np.uint8)
        return combined

    frames_bgr = []
    
    # 1. Hold Frame 1 (resting pose)
    for _ in range(hold_frames):
        frames_bgr.append(img1_bgr.copy())
        
    # 2. Smooth transition up to Frame 2 (raising hand, turning head, smoke rising)
    for i in range(1, transition_steps + 1):
        t = i / float(transition_steps + 1)
        frames_bgr.append(render_fluid_frame(t))
        
    # 3. Hold Frame 2 (taking the drag, looking at camera)
    for _ in range(hold_frames):
        frames_bgr.append(img2_bgr.copy())
        
    # 4. Smooth transition down back to Frame 1 (lowering hand, returning gaze)
    for i in range(transition_steps, 0, -1):
        t = i / float(transition_steps + 1)
        frames_bgr.append(render_fluid_frame(t))
        
    # Convert BGR to RGB PIL Images
    return [Image.fromarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB)) for f in frames_bgr]

def generate_circular_gif(rgb_frames, output_circle_path, duration=100):
    """
    Creates a transparent circular GIF with pulsing neon CRT cyan border ring.
    """
    w, h = rgb_frames[0].size
    cx, cy = w // 2, h // 2
    radius = min(w, h) // 2 - 4
    
    mask = Image.new('L', (w, h), 0)
    draw_m = ImageDraw.Draw(mask)
    draw_m.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=255)

    circle_frames = []
    for idx, f in enumerate(rgb_frames):
        transparent_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        cropped = Image.composite(f.convert('RGBA'), transparent_img, mask)
        draw = ImageDraw.Draw(cropped)
        accent = (20, 184, 166, 255) if (idx % 2 == 0) else (56, 189, 248, 255)
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
        output_circle_path,
        save_all=True,
        append_images=gif_frames[1:],
        duration=duration,
        loop=0,
        transparency=255,
        disposal=2,
        optimize=True
    )
    size_kb = os.path.getsize(output_circle_path) / 1024.0
    print(f"Successfully saved circular transparent GIF: {output_circle_path} ({size_kb:.1f} KB)")

def main():
    parser = argparse.ArgumentParser(description="Generate fluid animated GitHub PFP")
    parser.add_argument('--input1', '-i1', default='assets/current_pfp.png', help='Path to Frame 1 image')
    parser.add_argument('--input2', '-i2', default='assets/frame2_raw.png', help='Path to Frame 2 image')
    parser.add_argument('--output', '-o', default='assets/avatar.gif', help='Path to output animated GIF')
    parser.add_argument('--mode', '-m', choices=['fluid', 'cut'], default='fluid', help='Animation mode: fluid (default) or cut')
    parser.add_argument('--duration', '-d', type=int, default=100, help='Frame duration in ms (default: 100)')
    
    args = parser.parse_args()
    
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    in1_path = os.path.join(project_root, args.input1) if not os.path.isabs(args.input1) else args.input1
    in2_path = os.path.join(project_root, args.input2) if not os.path.isabs(args.input2) else args.input2
    out_path = os.path.join(project_root, args.output) if not os.path.isabs(args.output) else args.output
    out_circle_path = os.path.join(os.path.dirname(out_path), 'avatar_circle.gif')
    preview_path = os.path.join(os.path.dirname(out_path), 'preview_frames.png')
    
    print(f"Loading Frame 1 from: {in1_path}")
    print(f"Loading Frame 2 from: {in2_path}")
    
    img1_bgr = cv2.imread(in1_path)
    img2_bgr = cv2.imread(in2_path)
    
    if img1_bgr is None:
        raise FileNotFoundError(f"Frame 1 not found: {in1_path}")
    if img2_bgr is None:
        raise FileNotFoundError(f"Frame 2 not found: {in2_path}")
        
    # Standardize to Frame 1 dimensions (460x460)
    h, w = img1_bgr.shape[:2]
    img2_bgr = cv2.resize(img2_bgr, (w, h), interpolation=cv2.INTER_LANCZOS4)
    
    # Save preview side-by-side keyframe comparison
    preview_img = np.hstack([img1_bgr, img2_bgr])
    cv2.imwrite(preview_path, preview_img)
    print(f"Saved side-by-side preview to: {preview_path}")
    
    if args.mode == 'fluid':
        print("Synthesizing fluid in-between optical flow morphing frames...")
        # 3 hold1 + 5 up + 3 hold2 + 5 down = 16 frames @ 100ms = 1.6s loop
        frames = compute_fluid_sequence(img1_bgr, img2_bgr, transition_steps=5, hold_frames=3)
        duration = args.duration
    else:
        print("Using 2-frame cut mode...")
        f1_rgb = cv2.cvtColor(img1_bgr, cv2.COLOR_BGR2RGB)
        f2_rgb = cv2.cvtColor(img2_bgr, cv2.COLOR_BGR2RGB)
        frames = [Image.fromarray(f1_rgb), Image.fromarray(f2_rgb)]
        duration = 400
        
    print(f"Assembling {len(frames)} frames into animated GIF (duration={duration}ms, loop=0)...")
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
        optimize=True
    )
    print(f"Successfully saved square animated avatar: {out_path} ({os.path.getsize(out_path)/1024.0:.1f} KB)")
    
    # Also generate the circular transparent version for Profile README
    generate_circular_gif(frames, out_circle_path, duration=duration)
    
    # If in fluid mode, also save the direct 2-frame version as avatar_2frame.gif for reference
    if args.mode == 'fluid':
        out_2frame_path = os.path.join(os.path.dirname(out_path), 'avatar_2frame.gif')
        f1_rgb = cv2.cvtColor(img1_bgr, cv2.COLOR_BGR2RGB)
        f2_rgb = cv2.cvtColor(img2_bgr, cv2.COLOR_BGR2RGB)
        two_frames = [Image.fromarray(f1_rgb), Image.fromarray(f2_rgb)]
        two_frames[0].save(out_2frame_path, save_all=True, append_images=[two_frames[1]], duration=400, loop=0, optimize=True)
        print(f"Successfully saved reference 2-frame cut: {out_2frame_path}")

if __name__ == '__main__':
    main()
