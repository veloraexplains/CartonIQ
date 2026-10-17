const fs = require('fs');
const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add a useEffect to force the cursor style on all number inputs
const hookCode = `
  useEffect(() => {
    // Force the cursor color on all input elements
    const style = document.createElement('style');
    style.innerHTML = \`
      input[type="number"], input[type="text"] {
        caret-color: #fbbf24 !important;
      }
      ::selection {
        background-color: #fbbf24 !important;
        color: #000000 !important;
      }
    \`;
    document.head.appendChild(style);
  }, []);
`;

// Inject right after the first useEffect
if (!content.includes('caret-color: #fbbf24')) {
  const firstEffect = content.indexOf('useEffect(');
  if (firstEffect !== -1) {
    const insertPos = content.indexOf('});', firstEffect) + 3;
    content = content.slice(0, insertPos) + hookCode + content.slice(insertPos);
    fs.writeFileSync(path, content);
    console.log('✅ Cursor JS fix added to App.tsx!');
  }
} else {
  console.log('✅ Already fixed in App.tsx!');
}
