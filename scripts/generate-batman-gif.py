import cv2
import numpy as np
from PIL import Image
import math
import os

src_path = r'C:\Users\anish jha\.gemini\antigravity\brain\c3b127c2-0743-4d73-82e0-0fbec4661310\batman_jacked_front_1788789712791.jpg'
img = cv2.imread(src_path)
H_orig, W_orig = img.shape[:2]

target_w = 440
target_h = int(round(H_orig * (target_w / W_orig)))
base_bgr = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_AREA)
gray = cv2.cvtColor(base_bgr, cv2.COLOR_BGR2GRAY)

sy = target_h / H_orig
sx = target_w / W_orig

# Extract both left and right eye masks
ey1, ey2 = int(370 * sy), int(445 * sy)
ex1_l, ex2_l = int(260 * sx), int(355 * sx)
ex1_r, ex2_r = int(410 * sx), int(510 * sx)

def get_eye_blob(roi):
    _, thresh = cv2.threshold(roi, 200, 255, cv2.THRESH_BINARY)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(thresh)
    best_i = None
    best_area = 0
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        if area > best_area:
            best_area = area
            best_i = i
    mask = np.zeros_like(roi)
    if best_i is not None:
        mask[labels == best_i] = 255
    return mask

mask_l = get_eye_blob(gray[ey1:ey2, ex1_l:ex2_l])
mask_r = get_eye_blob(gray[ey1:ey2, ex1_r:ex2_r])

eye_mask_l = np.zeros_like(gray)
eye_mask_r = np.zeros_like(gray)
eye_mask_l[ey1:ey2, ex1_l:ex2_l] = mask_l
eye_mask_r[ey1:ey2, ex1_r:ex2_r] = mask_r
total_eye_mask = cv2.bitwise_or(eye_mask_l, eye_mask_r)

# Centroids
l_ys, l_xs = np.where(eye_mask_l > 0)
r_ys, r_xs = np.where(eye_mask_r > 0)
l_cy, l_cx = int(np.mean(l_ys)), int(np.mean(l_xs))
r_cy, r_cx = int(np.mean(r_ys)), int(np.mean(r_xs))

# Base image with eye sockets darkened
base_no_eyes = base_bgr.copy()
base_no_eyes[total_eye_mask > 0] = 0

# Breathing displacement vector field maps
# Muscular chest & traps expand on inhale
cx_mid = target_w / 2.0
weight_y = np.zeros((target_h, target_w), dtype=np.float32)
weight_x = np.zeros((target_h, target_w), dtype=np.float32)

for y in range(target_h):
    if y > 270:  # Below cowl forehead: neck, traps, chest
        wy = min(1.0, (y - 270) / 180.0)
        weight_y[y, :] = wy
    if y > 380:  # Chest pectorals & lats expand outward
        wx = min(1.0, (y - 380) / 180.0)
        for x in range(target_w):
            norm_x = (x - cx_mid) / cx_mid
            weight_x[y, x] = wx * norm_x

# Rain simulation
np.random.seed(42)
num_drops = 45
drops = []
for _ in range(num_drops):
    x0 = np.random.uniform(0, target_w)
    y0 = np.random.uniform(0, target_h)
    length = np.random.uniform(22, 38)
    speed = np.random.uniform(24, 36)
    alpha = np.random.uniform(0.35, 0.70)
    drops.append({'x0': x0, 'y0': y0, 'len': length, 'speed': speed, 'alpha': alpha})

total_frames = 32
frames_dark = []
frames_light = []

# Canny edges for lightning contour glint
edges_f = cv2.Canny(gray, 70, 190).astype(np.float32) / 255.0

grid_x, grid_y = np.meshgrid(np.arange(target_w), np.arange(target_h))
grid_x = grid_x.astype(np.float32)
grid_y = grid_y.astype(np.float32)

for f in range(total_frames):
    t = f / total_frames

    # 1. Muscular breathing: vertical rise + horizontal pectoral swell
    sin_breath = math.sin(2 * math.pi * t)
    dy = 2.0 * sin_breath
    dx = 1.4 * sin_breath

    map_x = (grid_x - (weight_x * dx)).clip(0, target_w - 1)
    map_y = (grid_y - (weight_y * dy)).clip(0, target_h - 1)

    frame_base = cv2.remap(base_no_eyes, map_x, map_y, interpolation=cv2.INTER_LINEAR)

    # 2. Eye blink & optic flare
    # Blink cycle at frames 22..26
    if f == 22:
        blink = 0.40
        flare = 0.75
    elif f == 23:
        blink = 0.0
        flare = 0.0
    elif f == 24:
        blink = 0.70
        flare = 1.45
    elif f == 25:
        blink = 1.0
        flare = 1.30
    else:
        blink = 1.0
        flare = 0.70 + 0.30 * math.sin(2 * math.pi * t)

    # Left and right eye blink geometry
    cur_eyes = np.zeros_like(gray)
    if blink > 0.05:
        for y, x in zip(l_ys, l_xs):
            new_y = int(round(l_cy + (y - l_cy) * min(1.0, blink) - (weight_y[y, x] * dy)))
            new_x = int(round(x - (weight_x[y, x] * dx)))
            if 0 <= new_y < target_h and 0 <= new_x < target_w:
                cur_eyes[new_y, new_x] = 255
        for y, x in zip(r_ys, r_xs):
            new_y = int(round(r_cy + (y - r_cy) * min(1.0, blink) - (weight_y[y, x] * dy)))
            new_x = int(round(x - (weight_x[y, x] * dx)))
            if 0 <= new_y < target_h and 0 <= new_x < target_w:
                cur_eyes[new_y, new_x] = 255

        if blink < 0.95:
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
            cur_eyes = cv2.morphologyEx(cur_eyes, cv2.MORPH_CLOSE, kernel)

    cur_eyes_f = cur_eyes.astype(np.float32) / 255.0

    # Gaussian optical bloom
    if flare > 0.05:
        bloom1 = cv2.GaussianBlur(cur_eyes_f, (13, 13), 0) * (0.85 * flare)
        bloom2 = cv2.GaussianBlur(cur_eyes_f, (27, 27), 0) * (0.50 * flare)
        total_bloom = np.clip(cur_eyes_f + bloom1 + bloom2, 0, 1.0)
    else:
        total_bloom = np.zeros_like(cur_eyes_f)

    # Composite eyes onto frame_base
    frame_dark = frame_base.astype(np.float32) / 255.0
    for c in range(3):
        frame_dark[:, :, c] = np.maximum(frame_dark[:, :, c], total_bloom)

    # 3. Ambient lightning contour flash at frame 30
    if f == 30:
        for c in range(3):
            frame_dark[:, :, c] = np.clip(frame_dark[:, :, c] + edges_f * 0.32, 0, 1.0)

    # 4. Gotham rain streaks
    slant = -0.18
    rain_overlay = np.zeros((target_h, target_w), dtype=np.float32)
    for drop in drops:
        cur_y = (drop['y0'] + f * drop['speed']) % target_h
        cur_x = (drop['x0'] + f * drop['speed'] * slant) % target_w
        x2 = cur_x + drop['len'] * slant
        y2 = cur_y + drop['len']
        cv2.line(rain_overlay, (int(round(cur_x)), int(round(cur_y))), (int(round(x2)), int(round(y2))), drop['alpha'], 1, cv2.LINE_AA)

    for c in range(3):
        frame_dark[:, :, c] = np.clip(frame_dark[:, :, c] + rain_overlay, 0, 1.0)

    dark_uint8 = (frame_dark * 255).astype(np.uint8)
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
