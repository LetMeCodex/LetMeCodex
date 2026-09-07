const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.resolve('preview_3d.html');
fs.writeFileSync(htmlPath, '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0d1117;"><img src="assets/profile-3d.svg" width="1000" height="560" style="display:block;" /></body></html>');

const out = 'C:\\Users\\anish jha\\.gemini\\antigravity\\brain\\c3b127c2-0743-4d73-82e0-0fbec4661310\\preview_3d.png';
execSync(`"${chrome}" --headless=new --screenshot="${out}" --window-size=1000,560 "${htmlPath}"`);
console.log('Rendered preview_3d.png:', fs.existsSync(out), fs.existsSync(out) ? fs.statSync(out).size : 0);

const actHtml = path.resolve('preview_act.html');
fs.writeFileSync(actHtml, '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0d1117;"><img src="assets/github-activity.svg" width="920" height="320" style="display:block;" /></body></html>');
const actOut = 'C:\\Users\\anish jha\\.gemini\\antigravity\\brain\\c3b127c2-0743-4d73-82e0-0fbec4661310\\preview_activity.png';
execSync(`"${chrome}" --headless=new --screenshot="${actOut}" --window-size=920,320 "${actHtml}"`);
console.log('Rendered preview_activity.png:', fs.existsSync(actOut), fs.existsSync(actOut) ? fs.statSync(actOut).size : 0);
