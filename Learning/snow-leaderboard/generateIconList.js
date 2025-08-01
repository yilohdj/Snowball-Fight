import fs from "fs";
import path from "path";

const PROFILE_ICONS_DIR = "./public/profile-icons";

function generateIconList() {
  console.log("🔍 Scanning profile icons directory...");
  console.log(`📁 Directory path: ${path.resolve(PROFILE_ICONS_DIR)}`);
  
  if (!fs.existsSync(PROFILE_ICONS_DIR)) {
    console.log("❌ Profile icons directory not found!");
    return;
  }
  
  console.log("✅ Directory exists, reading files...");
  const files = fs.readdirSync(PROFILE_ICONS_DIR);
  console.log(`📄 Found ${files.length} files in directory`);
  
  const iconIds = [];
  
  files.forEach(file => {
    if (file.endsWith('.png')) {
      const iconId = parseInt(file.replace('.png', ''));
      if (!isNaN(iconId)) {
        iconIds.push(iconId);
      }
    }
  });
  
  // Sort the icon IDs
  iconIds.sort((a, b) => a - b);
  
  console.log(`✅ Found ${iconIds.length} profile icons`);
  console.log(`📊 Icon ID range: ${Math.min(...iconIds)} - ${Math.max(...iconIds)}`);
  
  // Generate the updated LOCAL_ICONS set
  console.log(`\n📝 Update your lib/profileIcons.ts with:`);
  console.log(`const LOCAL_ICONS = new Set([${iconIds.join(', ')}]);`);
  
  // Also create a more readable version with line breaks
  const chunkedIds = [];
  for (let i = 0; i < iconIds.length; i += 20) {
    chunkedIds.push(iconIds.slice(i, i + 20));
  }
  
  console.log(`\n📝 Or use this more readable format:`);
  console.log(`const LOCAL_ICONS = new Set([`);
  chunkedIds.forEach((chunk, index) => {
    const prefix = index === 0 ? '  ' : '    ';
    const suffix = index === chunkedIds.length - 1 ? '' : ',';
    console.log(`${prefix}${chunk.join(', ')}${suffix}`);
  });
  console.log(`]);`);
  
  return iconIds;
}

generateIconList(); 