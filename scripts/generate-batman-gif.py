import cv2
import numpy as np
from PIL import Image
import math
import os

src_path = r'C:\Users\anish jha\.gemini\antigravity\brain\c3b127c2-0743-4d73-82e0-0fbec4661310\batman_portrait_1788780767555.jpg'
img = cv2.imread(src_path)
H_orig, W_orig = img.shape[:2]

target_w = 440
target_h = int(round(H_orig * (target_w / W_orig)))
base_bgr = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_AREA)
gray = cv2.cvtColor(base_bgr, cv2.COLOR_BGR2GRAY)

sy = target_h / H_orig
sx = target_w / W_orig
ey1, ey2 = int(320 * sy), int(385 * sy)
ex1, ex2 = int(460 * sx), int(600 * sx)

roi = gray[ey1:ey2, ex1:ex2]
_, thresh = cv2.threshold(roi, 210, 255, cv2.THRESH_BINARY)
num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(thresh)

eye_mask = np.zeros_like(gray)
for i in range(1, num_labels):
    if stats[i, cv2.CC_STAT_AREA] > 10:
        c_mask = (labels == i).astype(np.uint8) * 255
        eye_mask[ey1:ey2, ex1:ex2] = np.maximum(eye_mask[ey1:ey2, ex1:ex2], c_mask)

eye_ys, eye_xs = np.where(eye_mask > 0)
eye_cy = int(np.mean(eye_ys))
eye_cx = int(np.mean(eye_xs))

# Base image with eye socket blacked out (for drawing dynamic eye on top)
base_no_eyes = base_bgr.copy()
base_no_eyes[eye_mask > 0] = 0

# Smooth breathing displacement weight map
# 0 at head/cowl (y < 360), ramping to 1.0 at chest/shoulders (y > 480)
breath_weight = np.zeros((target_h, target_w), dtype=np.float32)
for y in range(target_h):
    if y > 360:
        w = min(1.0, (y - 360) / 120.0)
        breath_weight[y, :] = w

# Rain simulation
np.random.seed(1337)
num_drops = 42
drops = []
for _ in range(num_drops):
    x0 = np.random.uniform(0, target_w)
    y0 = np.random.uniform(0, target_h)
    length = np.random.uniform(20, 36)
    speed = np.random.uniform(24, 34)
    alpha = np.random.uniform(0.35, 0.72)
    drops.append({'x0': x0, 'y0': y0, 'len': length, 'speed': speed, 'alpha': alpha})

total_frames = 32
frames_dark = []
frames_light = []

# Canny edges for lightning contour glint
edges_f = cv2.Canny(gray, 70, 190).astype(np.float32) / 255.0

for f in range(total_frames):
    t = f / total_frames

    # 1. Subtle smooth breathing
    dy = 1.4 * math.sin(2 * math.pi * t)
    # Remap image with vertical displacement modulated by breath_weight
    map_x, map_y = np.meshgrid(np.arange(target_w), np.arange(target_h))
    map_x = map_x.astype(np.float32)
    map_y = (map_y.astype(np.float32) - (breath_weight * dy)).clip(0, target_h - 1)
    
    frame_base = cv2.remap(base_no_eyes, map_x, map_y, interpolation=cv2.INTER_LINEAR)

    # 2. Eye blink & pulse
    # Blink cycle at frames 22..26:
    # 22: squint (0.45)
    # 23: fully closed (0.0)
    # 24: opening with snap (0.65)
    # 25: wide open flare (1.20)
    # others: breathing glow
    if f == 22:
        blink = 0.45
        flare = 0.8
    elif f == 23:
        blink = 0.0
        flare = 0.0
    elif f == 24:
        blink = 0.65
        flare = 1.35
    elif f == 25:
        blink = 1.0
        flare = 1.25
    else:
        blink = 1.0
        flare = 0.65 + 0.35 * math.sin(2 * math.pi * t)

    # Current eye geometry
    cur_eye = np.zeros_like(eye_mask)
    if blink > 0.05:
        for y, x in zip(eye_ys, eye_xs):
            new_y = int(round(eye_cy + (y - eye_cy) * min(1.0, blink)))
            if 0 <= new_y < target_h:
                cur_eye[new_y, x] = 255
        # Morphological close if compressed to fill small gaps
        if blink < 0.95:
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
            cur_eye = cv2.morphologyEx(cur_eye, cv2.MORPH_CLOSE, kernel)

    cur_eye_f = cur_eye.astype(np.float32) / 255.0

    # Gaussian bloom around eye
    if flare > 0.05:
        bloom1 = cv2.GaussianBlur(cur_eye_f, (13, 13), 0) * (0.85 * flare)
        bloom2 = cv2.GaussianBlur(cur_eye_f, (27, 27), 0) * (0.50 * flare)
        total_bloom = np.clip(cur_eye_f + bloom1 + bloom2, 0, 1.0)
    else:
        total_bloom = np.zeros_like(cur_eye_f)

    # Composite eye onto frame_base
    frame_dark = frame_base.astype(np.float32) / 255.0
    for c in range(3):
        frame_dark[:, :, c] = np.maximum(frame_dark[:, :, c], total_bloom)

    # 3. Ambient lightning contour flash at frame 30
    if f == 30:
        for c in range(3):
            frame_dark[:, :, c] = np.clip(frame_dark[:, :, c] + edges_f * 0.28, 0, 1.0)

    # 4. Gotham rain streaks
    slant = -0.22
    rain_overlay = np.zeros((target_h, target_w), dtype=np.float32)
    for drop in drops:
        cur_y = (drop['y0'] + f * drop['speed']) % target_h
        cur_x = (drop['x0'] + f * drop['speed'] * slant) % target_w
        x2 = cur_x + drop['len'] * slant
        y2 = cur_y + drop['len']
        cv2.line(rain_overlay, (int(round(cur_x)), int(round(cur_y))), (int(round(x2)), int(round(y2))), drop['alpha'], 1, cv2.LINE_AA)

    for c in range(3):
        frame_dark[:, :, c] = np.clip(frame_dark[:, :, c] + rain_overlay, 0, 1.0)

    # Dark uint8
    dark_uint8 = (frame_dark * 255).astype(np.uint8)
    
    # Light uint8 (clean inversion: white paper background, dark ink lines)
    light_uint8 = 255 - dark_uint8

    im_dark_rgb = Image.fromarray(cv2.cvtColor(dark_uint8, cv2.COLOR_BGR2RGB))
    im_light_rgb = Image.fromarray(cv2.cvtColor(light_uint8, cv2.COLOR_BGR2RGB))

    frames_dark.append(im_dark_rgb.convert('P', palette=Image.ADAPTIVE, colors=64))
    frames_light.append(im_light_rgb.convert('P', palette=Image.ADAPTIVE, colors=64))

# Save dark & light GIFs in assets/
assets_dark = 'assets/portrait-dark.gif'
assets_light = 'assets/portrait-light.gif'

frames_dark[0].save(assets_dark, save_all=True, append_images=frames_dark[1:], duration=60, loop=0, optimize=True)
frames_light[0].save(assets_light, save_all=True, append_images=frames_light[1:], duration=60, loop=0, optimize=True)

# Also save copies to brain folder for user review
brain_dir = r'C:\Users\anish jha\.gemini\antigravity\brain\c3b127c2-0743-4d73-82e0-0fbec4661310'
frames_dark[0].save(os.path.join(brain_dir, 'batman-dark.gif'), save_all=True, append_images=frames_dark[1:], duration=60, loop=0, optimize=True)
frames_light[0].save(os.path.join(brain_dir, 'batman-light.gif'), save_all=True, append_images=frames_light[1:], duration=60, loop=0, optimize=True)

print('Success! Generated:')
print('assets/portrait-dark.gif ->', os.path.getsize(assets_dark), 'bytes')
print('assets/portrait-light.gif ->', os.path.getsize(assets_light), 'bytes')
