import subprocess
import os

art_scratch = r'C:\Users\anish jha\.gemini\antigravity\brain\c3b127c2-0743-4d73-82e0-0fbec4661310\scratch'
os.makedirs(art_scratch, exist_ok=True)

svg_path = os.path.abspath('assets/tech-stack.svg')
html_path = os.path.join(art_scratch, 'view_svg.html')
png_path = os.path.join(art_scratch, 'rendered_archipelago.png')

html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ margin: 0; padding: 0; background: #F6F5EF; overflow: hidden; }}
  img {{ width: 2400px; height: 1500px; display: block; }}
</style>
</head>
<body>
  <img src="file:///{svg_path.replace(os.sep, '/')}" />
</body>
</html>"""

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
cmd = [
    chrome,
    '--headless=new',
    '--disable-gpu',
    '--screenshot=' + png_path,
    '--window-size=2400,1500',
    '--hide-scrollbars',
    'file:///' + html_path.replace(os.sep, '/')
]
res = subprocess.run(cmd, capture_output=True, text=True)
print('Return code:', res.returncode)
print('Screenshot generated at:', png_path)
