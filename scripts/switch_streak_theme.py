#!/usr/bin/env python3
import sys
import os
import subprocess
import argparse

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

THEME_NAMES = {
    'github': 'GitHub Green (Emerald/Lime)',
    'inferno': 'Inferno Flame (Orange/Red/Yellow)',
    'arcane': 'Arcane Violet (Purple/Magenta)',
    'cyber': 'Cyber Aurora (Cyan/Electric Blue)',
    'zen': 'Zen Blossom (Pink/Lavender)',
    'legendary': 'Legendary Gold (Amber/Gold)',
    'void': 'Cosmic Void (Deep Purple/Blue)'
}

TIER_PREVIEWS = {
    1: (0, 'Dormant (0d - tiny ember, smoke)'),
    2: (2, 'Spark (2d - nascent flicker)'),
    3: (5, 'Flame (5d - living fire)'),
    4: (10, 'Hot (10d - bright, rising particles)'),
    5: (21, 'Blaze (21d - layered cores, aura)'),
    6: (45, 'Inferno (45d - triple tongues, distortion)'),
    7: (75, 'Legendary (75d - orbital energy ring)'),
    8: (120, 'Mythic (120d - hyper-core, Git nodes)')
}

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_cmd(cmd, cwd=ROOT_DIR):
    res = subprocess.run(cmd, shell=True, cwd=cwd, text=True, capture_output=True, encoding='utf-8')
    if res.returncode != 0 and res.stderr:
        print(f"[Error] {res.stderr.strip()}")
    return res

def apply_streak(theme='github', streak=None, push=True):
    print("\n" + "="*62)
    print(f" 🔥 Updating GitStreak Flame...")
    print(f" • Theme: {theme} ({THEME_NAMES.get(theme, theme)})")
    if streak is not None:
        print(f" • Forced Streak Test: {streak} Days")
        cmd = f"node scripts/generate-streak-svg.js --theme={theme} --streak={streak}"
        commit_msg = f"chore(streak): test GitStreak flame ({streak} days, {theme} mode)"
    else:
        print(f" • Live Mode: Synced with real GitHub contribution data")
        cmd = f"node scripts/generate-streak-svg.js --theme={theme}"
        commit_msg = f"chore(streak): update GitStreak flame ({theme} theme)"

    print(f"[+] Running: {cmd}")
    res = run_cmd(cmd)
    if res.returncode != 0:
        print("[!] Generation failed.")
        return False
    print(res.stdout.strip())

    if push:
        print("\n[+] Staging and committing changes...")
        run_cmd("git add assets/git-streak.svg")
        c_res = run_cmd(f'git commit -m "{commit_msg}"')
        print(c_res.stdout.strip() or "No new diff to commit.")
        print("[+] Pushing to GitHub remote (origin/main)...")
        p_res = run_cmd("git push origin main")
        if p_res.returncode == 0:
            print("\n" + "="*62)
            print(" [OK] SUCCESS! Your GitHub profile flame is live!")
            print(" 👉 Refresh https://github.com/LetMeCodex to view!")
            print("="*62 + "\n")
            return True
        else:
            print("[!] Push failed:", p_res.stderr)
            return False
    return True

def interactive_menu():
    while True:
        print("\n" + "="*64)
        print("      🔥 LetMeCodex GitStreak Flame Control Center 🔥       ")
        print("="*64)
        print(" [THEME MODES]")
        print("  1. 🟢 GitHub Green    5. 🌸 Zen Blossom")
        print("  2. 🔥 Inferno Flame   6. 🏆 Legendary Gold")
        print("  3. 💜 Arcane Violet   7. 🌌 Cosmic Void")
        print("  4. 💙 Cyber Aurora")
        print("-" * 64)
        print(" [STREAK SIMULATOR]")
        print("  8. 🧪 Test Streak Progression (Dormant -> Mythic)")
        print("  9. ⚡ Sync Live Real-Time Streak from GitHub API")
        print("  0. 🚪 Exit")
        print("="*64)

        choice = input("Select an option [0-9]: ").strip()
        if choice == '0':
            print("Exiting.")
            break
        elif choice == '1':
            apply_streak('github')
            break
        elif choice == '2':
            apply_streak('inferno')
            break
        elif choice == '3':
            apply_streak('arcane')
            break
        elif choice == '4':
            apply_streak('cyber')
            break
        elif choice == '5':
            apply_streak('zen')
            break
        elif choice == '6':
            apply_streak('legendary')
            break
        elif choice == '7':
            apply_streak('void')
            break
        elif choice == '8':
            print("\nSelect progression state to simulate:")
            for k, (s, label) in TIER_PREVIEWS.items():
                print(f"  [{k}] {label}")
            t_choice = input("Select tier [1-8]: ").strip()
            if t_choice in [str(i) for i in range(1, 9)]:
                days, _ = TIER_PREVIEWS[int(t_choice)]
                apply_streak('inferno' if days > 20 else 'github', streak=days)
                break
        elif choice == '9':
            apply_streak('github')
            break
        else:
            print("[!] Invalid option.")

def main():
    parser = argparse.ArgumentParser(description="GitStreak Flame Controller")
    parser.add_argument("--theme", choices=list(THEME_NAMES.keys()), default="github", help="Color theme")
    parser.add_argument("--streak", type=int, help="Simulate a specific streak count (0 to 100+)")
    parser.add_argument("--real", action="store_true", help="Sync with live GitHub contribution data")
    parser.add_argument("--no-push", action="store_true", help="Generate SVG without git push")

    args = parser.parse_args()

    if len(sys.argv) > 1:
        apply_streak(theme=args.theme, streak=args.streak, push=not args.no_push)
    else:
        interactive_menu()

if __name__ == '__main__':
    main()
