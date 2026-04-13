// Renames dist-html/index.html → ChoreQuest.html and cleans up the folder
import { readFileSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

const src = join('dist-html', 'index.html');
const dest = 'ChoreQuest.html';

if (!existsSync(src)) {
  console.error('❌  dist-html/index.html not found. Did the build succeed?');
  process.exit(1);
}

let html = readFileSync(src, 'utf-8');

// Patch the <title> and add a small banner comment
html = html.replace('<title>ChoreQuest - Make Chores Fun!</title>',
  '<title>ChoreQuest 🏆 - Family Chore Tracker</title>');

// Add generator comment
html = '<!-- ChoreQuest — Save this file and open in any browser. All data is stored locally. -->\n' + html;

writeFileSync(dest, html, 'utf-8');

// Clean up temp folder
try { rmSync('dist-html', { recursive: true, force: true }); } catch {}

const sizeKb = Math.round(readFileSync(dest).length / 1024);
console.log(`\n✅  ChoreQuest.html created! (${sizeKb} KB)`);
console.log('   → Open it in any browser — works completely offline.');
console.log('   → Share the file with family — each person keeps their own data.\n');
