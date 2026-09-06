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

DAY_NAMES = {
    0: ("Sunday", "Solar Supernova", "Amber #F59E0B", "[Sun]"),
    1: ("Monday", "Cyberpunk Phosphor", "Emerald #10B981", "[Mon]"),
    2: ("Tuesday", "Quantum Aurora", "Cyan #38BDF8", "[Tue]"),
    3: ("Wednesday", "Retro Synthwave", "Rose #F43F5E", "[Wed]"),
    4: ("Thursday", "Zen Hydro-Wave", "Teal #14B8A6", "[Thu]"),
    5: ("Friday", "Conway's Living Colony", "Lime #84CC16", "[Fri]"),
    6: ("Saturday", "Halloween Spook", "Pumpkin #FA7A18", "[Sat]"),
}

DAY_ALIASES = {
    'sun': 0, 'sunday': 0, '0': 0,
    'mon': 1, 'monday': 1, '1': 1,
    'tue': 2, 'tuesday': 2, '2': 2,
    'wed': 3, 'wednesday': 3, '3': 3,
    'thu': 4, 'thursday': 4, '4': 4,
    'fri': 5, 'friday': 5, '5': 5,
    'sat': 6, 'saturday': 6, '6': 6,
}

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_cmd(cmd, cwd=ROOT_DIR):
    res = subprocess.run(cmd, shell=True, cwd=cwd, text=True, capture_output=True, encoding='utf-8')
    if res.returncode != 0 and res.stderr:
        print(f"[Error] {res.stderr.strip()}")
    return res

def set_theme(target, push=True):
    print("\n" + "="*58)
    if target == "cycle":
        print(" [SHOWCASE] Activating ALL 7 DAYS AUTO-MORPH SHOWCASE for Matrix & Streak...")
        cmd_matrix = "node scripts/generate-github-activity.js --cycle"
        cmd_streak = "node scripts/generate-streak-svg.js --cycle"
        commit_msg = "feat(matrix+streak): activate synchronized 7-day auto-morph showcase animation"
    elif target == "today":
        print(" [SYNC] Syncing Matrix & Streak to Current Real-World Calendar Day...")
        cmd_matrix = "node scripts/generate-github-activity.js"
        cmd_streak = "node scripts/generate-streak-svg.js"
        commit_msg = "chore(matrix+streak): sync matrix and streak to today real calendar day"
    else:
        day_idx = int(target)
        dname, tname, color, sym = DAY_NAMES[day_idx]
        print(f" {sym} Setting Matrix & Streak Theme -> {dname}: {tname} ({color})...")
        cmd_matrix = f"node scripts/generate-github-activity.js --day={day_idx}"
        cmd_streak = f"node scripts/generate-streak-svg.js --day={day_idx}"
        commit_msg = f"feat(matrix+streak): switch active theme to {dname} ({tname})"

    print(f"[+] Running: {cmd_matrix}")
    res1 = run_cmd(cmd_matrix)
    print(res1.stdout.strip())

    print(f"[+] Running: {cmd_streak}")
    res2 = run_cmd(cmd_streak)
    print(res2.stdout.strip())

    if res1.returncode != 0 or res2.returncode != 0:
        print("[!] Generation failed.")
        return False

    if push:
        print("\n[+] Staging and committing changes...")
        run_cmd("git add assets/github-activity*.svg assets/git-streak*.svg")
        c_res = run_cmd(f'git commit -m "{commit_msg}"')
        print(c_res.stdout.strip() or "No new diff to commit.")
        print("[+] Pushing to GitHub remote (origin/main)...")
        p_res = run_cmd("git push origin main")
        if p_res.returncode == 0:
            print("\n" + "="*58)
            print(" [OK] SUCCESS! Your GitHub profile is now updated!")
            print(" >> Refresh https://github.com/LetMeCodex to see it live!")
            print("="*58 + "\n")
            return True
        else:
            print("[!] Push failed:", p_res.stderr)
            return False
    return True

def interactive_menu():
    while True:
        print("\n" + "="*62)
        print("   LetMeCodex GitHub Matrix Easter Egg Control Center   ")
        print("="*62)
        print(" [1] Sun - Solar Supernova (Amber #F59E0B)")
        print(" [2] Mon - Cyberpunk Phosphor (Emerald #10B981)")
        print(" [3] Tue - Quantum Aurora (Cyan #38BDF8)")
        print(" [4] Wed - Retro Synthwave (Rose #F43F5E)")
        print(" [5] Thu - Zen Hydro-Wave (Teal #14B8A6)")
        print(" [6] Fri - Conway Living Colony (Lime #84CC16)")
        print(" [7] Sat - Halloween Spook (Jack-o-Lantern #FA7A18)")
        print(" [8] AUTO-CYCLE - Continuous 7-Day Morph Showcase")
        print(" [9] SYNC TODAY - Match Today Real Calendar Day")
        print(" [0] Exit")
        print("="*62)
        choice = input("Select theme option [0-9]: ").strip()
        if choice == '0':
            print("Exiting.")
            break
        elif choice in [str(i) for i in range(1, 8)]:
            target_day = int(choice) - 1
            set_theme(target_day)
            break
        elif choice == '8':
            set_theme("cycle")
            break
        elif choice == '9':
            set_theme("today")
            break
        else:
            print("[!] Invalid option. Please select 0-9.")

def main():
    parser = argparse.ArgumentParser(description="LetMeCodex Matrix Easter Egg Switcher")
    parser.add_argument("--day", help="Target day: sun, mon, tue, wed, thu, fri, sat (or 0-6)")
    parser.add_argument("--cycle", action="store_true", help="Activate continuous 7-day auto-morph cycle")
    parser.add_argument("--today", action="store_true", help="Sync to today real calendar day")
    parser.add_argument("--no-push", action="store_true", help="Generate SVG only without git commit/push")

    args = parser.parse_args()

    push = not args.no_push

    if args.cycle:
        set_theme("cycle", push=push)
    elif args.today:
        set_theme("today", push=push)
    elif args.day:
        d_lower = args.day.lower()
        if d_lower in DAY_ALIASES:
            set_theme(DAY_ALIASES[d_lower], push=push)
        else:
            print(f"[!] Unknown day '{args.day}'. Choose from: sun, mon, tue, wed, thu, fri, sat")
    else:
        interactive_menu()

if __name__ == "__main__":
    main()
