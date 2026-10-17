const fs = require('fs');
const path = 'android/app/build.gradle';
let content = fs.readFileSync(path, 'utf8');

// Remove any broken signingConfigs block we tried to add
content = content.replace(/signingConfigs\s*\{[\s\S]*?\n\s*\}\n/m, '');

// Find the buildTypes block
const buildTypesIndex = content.indexOf('buildTypes {');
if (buildTypesIndex !== -1) {
  // Insert the signingConfigs block right BEFORE buildTypes
  const signingBlock = `signingConfigs {
        release {
            storeFile file("/data/data/com.termux/files/home/cartoniq-release.keystore")
            storePassword "CartonIQ2026"
            keyAlias "cartoniq"
            keyPassword "CartonIQ2026"
        }
    }

    `;
  
  content = content.slice(0, buildTypesIndex) + signingBlock + content.slice(buildTypesIndex);

  // Now, add the signingConfig line INSIDE the release buildType
  // We target the release block specifically
  content = content.replace(/(release\s*\{)/, `$1\n            signingConfig signingConfigs.release`);
  
  fs.writeFileSync(path, content);
  console.log('✅ Fixed build.gradle successfully!');
} else {
  console.log('❌ Could not find buildTypes in build.gradle');
}
