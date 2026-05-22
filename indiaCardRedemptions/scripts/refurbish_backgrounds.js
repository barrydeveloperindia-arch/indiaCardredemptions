const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/app/index.tsx',
  'src/app/explore.tsx',
  'src/app/insights.tsx',
  'src/app/intel.tsx',
  'src/app/deals.tsx',
  'src/app/concierge.tsx',
  'src/app/consultation.tsx',
  'src/components/WalletCard.tsx',
  'src/components/PremiumSlider.tsx',
  'src/components/ArbitrageCalculator.tsx',
  'src/components/AffiliateEngine.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/components/AppTabs.tsx'
];

targetFiles.forEach(fileRelPath => {
  const filePath = path.resolve(__dirname, '..', fileRelPath);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${fileRelPath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Swap background asset to white gold
  content = content.replace(/dark_luxury_bg\.png/g, 'white_gold_bg.png');
  content = content.replace(/minimalist_white_luxury_bg\.png/g, 'white_gold_bg.png');

  // 2. Adjust ImageBackground opacity for light theme readability
  content = content.replace(/opacity:\s*0\.4/g, 'opacity: 0.75');

  // 3. Swap overlays back to clean light overlays
  content = content.replace(/rgba\(9,\s*10,\s*15,\s*0\.4\)/g, 'rgba(255, 255, 255, 0.45)');
  content = content.replace(/rgba\(9,\s*10,\s*15,\s*0\.9\)/g, 'rgba(255, 255, 255, 0.85)');

  // 4. Update BlurView tints from dark to light / extraLight
  content = content.replace(/tint="dark"/g, 'tint="light"');

  // 5. Update text colors back to charcoal readables
  content = content.replace(/#F3F4F6/g, '#1A1E26'); // light text -> deep charcoal
  content = content.replace(/#9CA3AF/g, '#4B5563'); // silver grey text -> charcoal secondary
  content = content.replace(/#D1D5DB/g, '#374151'); // light grey -> dark grey

  // 6. Update borders to subtle dark/gold translucent
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, 'rgba(212, 175, 55, 0.12)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.15\)/g, 'rgba(212, 175, 55, 0.18)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'rgba(0, 0, 0, 0.04)');

  // 7. Update panel overlays back to frosted white glass
  content = content.replace(/rgba\(20,\s*22,\s*31,\s*0\.6\)/g, 'rgba(255, 255, 255, 0.75)');
  content = content.replace(/rgba\(20,\s*22,\s*31,\s*0\.5\)/g, 'rgba(255, 255, 255, 0.65)');
  content = content.replace(/rgba\(20,\s*22,\s*31,\s*0\.4\)/g, 'rgba(255, 255, 255, 0.55)');
  content = content.replace(/rgba\(20,\s*22,\s*31,\s*0\.15\)/g, 'rgba(255, 255, 255, 0.25)');

  // 8. Update solid layouts
  content = content.replace(/backgroundColor:\s*'#14161F'/g, "backgroundColor: '#ffffff'");
  content = content.replace(/backgroundColor:\s*'#090A0F'/g, "backgroundColor: '#FAF9F6'");
  content = content.replace(/backgroundColor:\s*'#101116'/g, "backgroundColor: '#ffffff'");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully transitioned ${fileRelPath} to White Gold & Snow Quartz layout.`);
});
