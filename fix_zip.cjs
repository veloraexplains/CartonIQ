const fs = require('fs');
const path = 'src/components/settings/FactorySettingsView.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// The button starts around line 309 (the <a href...) and ends at 322 (the </div>)
// Let's look for the exact line with 'onClick={onDownloadProjectZip}'
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onClick={onDownloadProjectZip}')) {
    startIndex = i - 6; // go back to the opening <div> or <a>
    break;
  }
}

if (startIndex !== -1) {
  // Find the closing </div> after the button
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].trim() === '</div>' && lines[i-1].includes('</a>')) {
      endIndex = i;
      break;
    }
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  console.log(`Removing lines ${startIndex + 1} to ${endIndex + 1}`);
  lines.splice(startIndex, endIndex - startIndex + 1);
  fs.writeFileSync(path, lines.join('\n'));
  console.log('✅ Download Project ZIP button completely removed.');
} else {
  console.log('❌ Could not find the exact block. Trying string replace fallback...');
  let content = lines.join('\n');
  // Match the <a> tag and everything up to </a>
  const regex = /<a\s+href="#"\s+onClick=\{onDownloadProjectZip\}[\s\S]*?<\/a>/;
  if (regex.test(content)) {
    content = content.replace(regex, '');
    fs.writeFileSync(path, content);
    console.log('✅ Removed via Regex.');
  } else {
    console.log('❌ Regex also failed. Please check the file manually.');
  }
}
