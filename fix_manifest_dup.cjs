const fs = require('fs');
const path = 'android/app/src/main/AndroidManifest.xml';
let content = fs.readFileSync(path, 'utf8');
// Remove all INTERNET permissions
content = content.replace(/<uses-permission android:name="android.permission.INTERNET" \/>/g, '');
// Put ONE back at the top
content = content.replace('<application', '    <uses-permission android:name="android.permission.INTERNET" />\n    <application');
fs.writeFileSync(path, content);
console.log('✅ Fixed duplicate permissions!');
