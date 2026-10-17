const fs = require('fs');
const path = 'android/app/build.gradle';
let content = fs.readFileSync(path, 'utf8');
if (content.includes('signingConfigs {')) {
  content = content.replace(/signingConfigs\s*\{[\s\S]*?\n\s*\}\n/m, '');
}
const signingBlock = `
    signingConfigs {
        release {
            storeFile file("/data/data/com.termux/files/home/cartoniq-release.keystore")
            storePassword "CartonIQ2026"
            keyAlias "cartoniq"
            keyPassword "CartonIQ2026"
        }
    }
    buildTypes {`;
content = content.replace('buildTypes {', signingBlock);
if (content.includes('release {')) {
  content = content.replace('release {', 'release {\n            signingConfig signingConfigs.release');
}
fs.writeFileSync(path, content);
console.log('✅ Simple signing config added to build.gradle!');
