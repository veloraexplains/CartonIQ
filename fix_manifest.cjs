const fs = require('fs');
const path = 'android/app/src/main/AndroidManifest.xml';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" \/>/g, '');
content = content.replace(/<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" \/>/g, '');
const permissions = `
    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
`;
if (content.includes('<application')) {
  content = content.replace('<application', permissions + '\n    <application');
  fs.writeFileSync(path, content);
  console.log('✅ Permissions added successfully to the top!');
} else {
  console.log('❌ Could not find <application tag.');
}
