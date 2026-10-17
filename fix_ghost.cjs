const fs = require('fs');
const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add a function to disable selection on inputs
const fixCode = `
  useEffect(() => {
    // Disable the Android text selection (ghost handles) globally
    const disableSelection = () => {
      document.querySelectorAll('input').forEach(input => {
        input.setAttribute('style', 'user-select: none; -webkit-user-select: none;');
      });
    };
    
    // Run immediately and whenever the DOM changes
    disableSelection();
    const observer = new MutationObserver(disableSelection);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);
`;

// Inject after the first useEffect
if (!content.includes('disableSelection')) {
  const firstEffect = content.indexOf('useEffect(');
  if (firstEffect !== -1) {
    const insertPos = content.indexOf('});', firstEffect) + 3;
    content = content.slice(0, insertPos) + fixCode + content.slice(insertPos);
    fs.writeFileSync(path, content);
    console.log('✅ Ghost handles permanently disabled!');
  }
} else {
  console.log('✅ Already fixed!');
}
