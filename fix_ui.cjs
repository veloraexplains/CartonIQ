const fs = require('fs');

// 1. Remove Header Button from App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
const headerBtn = `
            <button
              onClick={handleDownloadProjectZip}
              disabled={isGeneratingZip}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3.5 py-1.5 rounded-xl transition-all shadow-md shadow-emerald-950"
              title="Download Termux-Ready Project ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isGeneratingZip ? 'Downloading...' : 'Termux ZIP'}
              </span>
            </button>`;

if (appCode.includes(headerBtn)) {
  appCode = appCode.replace(headerBtn, '');
  fs.writeFileSync('src/App.tsx', appCode);
  console.log('✅ Header download button removed.');
} else {
  // Try a regex fallback if exact match fails due to spacing
  const regex = /<button\s+onClick=\{handleDownloadProjectZip\}[\s\S]*?<\/button>/;
  if (regex.test(appCode)) {
    appCode = appCode.replace(regex, '');
    fs.writeFileSync('src/App.tsx', appCode);
    console.log('✅ Header download button removed (via regex).');
  } else {
    console.log('❌ Could not find header button in App.tsx');
  }
}

// 2. Remove Termux Build Tab & Download ZIP section from FactorySettingsView.tsx
let factoryCode = fs.readFileSync('src/components/settings/FactorySettingsView.tsx', 'utf8');

// Remove the Tab definition
const tabDef = `{ id: 'termux', label: 'Termux Build', icon: Terminal },`;
if (factoryCode.includes(tabDef)) {
  factoryCode = factoryCode.replace(tabDef, '');
  console.log('✅ Termux Build tab removed.');
}

// Since there are multiple lines for the Download Project ZIP button, let's find the block by its surrounding div
const zipBlockRegex = /\{activeTab === 'termux' && \([\s\S]*?<\/div>\s*\)\}/;
if (zipBlockRegex.test(factoryCode)) {
  factoryCode = factoryCode.replace(zipBlockRegex, '');
  fs.writeFileSync('src/components/settings/FactorySettingsView.tsx', factoryCode);
  console.log('✅ Download Project ZIP UI block removed.');
} else {
  // Fallback: Just remove the specific button/span if it's not wrapped in activeTab === 'termux'
  const fallbackRegex = /<div className="bg-slate-900\/80[\s\S]*?Download Project ZIP \(101 KB\)[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  if (fallbackRegex.test(factoryCode)) {
    factoryCode = factoryCode.replace(fallbackRegex, '');
    fs.writeFileSync('src/components/settings/FactorySettingsView.tsx', factoryCode);
    console.log('✅ Download Project ZIP UI block removed (fallback).');
  } else {
    console.log('❌ Could not find Download ZIP block in FactorySettingsView.tsx');
  }
}
