const fs = require('fs');
const path = 'src/components/settings/FactorySettingsView.tsx';
let code = fs.readFileSync(path, 'utf8');

// This regex finds the <button> that contains onDownloadProjectZip and removes it completely
const buttonRegex = /<button\s+[^>]*onClick=\{onDownloadProjectZip\}[\s\S]*?<\/button>/;

if (buttonRegex.test(code)) {
  code = code.replace(buttonRegex, '');
  fs.writeFileSync(path, code);
  console.log('✅ Successfully removed the Download ZIP button!');
} else {
  console.log('❌ Could not find the button. Please check manually.');
}
