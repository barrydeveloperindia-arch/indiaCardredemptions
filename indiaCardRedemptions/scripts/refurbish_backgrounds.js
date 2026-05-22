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

  // 1. Swap background asset
  content = content.replace(/minimalist_white_luxury_bg\.png/g, 'dark_luxury_bg.png');

  // 2. Adjust ImageBackground opacity for dark theme
  content = content.replace(/opacity:\s*0\.7/g, 'opacity: 0.4');

  // 3. Swap white gradient overlays to obsidian overlays
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.[2-7]\)/g, 'rgba(9, 10, 15, 0.4)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*1\)/g, 'rgba(9, 10, 15, 0.9)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.8\)/g, 'rgba(9, 10, 15, 0.9)');

  // 4. Update BlurView tints from light to dark
  content = content.replace(/tint="light"/g, 'tint="dark"');

  // 5. Update hardcoded light colors
  content = content.replace(/#111827/g, '#F3F4F6'); // dark charcoal text -> light grey text
  content = content.replace(/#4B5563/g, '#9CA3AF'); // medium grey text -> silver-grey text
  content = content.replace(/#374151/g, '#D1D5DB'); // dark grey -> light grey

  // 6. Update borders from dark to translucent white
  content = content.replace(/rgba\(0,\s*0,\s*0,\s*0\.1\)/g, 'rgba(255, 255, 255, 0.1)');
  content = content.replace(/rgba\(0,\s*0,\s*0,\s*0\.2\)/g, 'rgba(255, 255, 255, 0.15)');
  content = content.replace(/rgba\(0,\s*0,\s*0,\s*0\.05\)/g, 'rgba(255, 255, 255, 0.05)');

  // 7. Update white backdrops in elements to translucent dark-element panels
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.6\)/g, 'rgba(20, 22, 31, 0.6)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.5\)/g, 'rgba(20, 22, 31, 0.5)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.4\)/g, 'rgba(20, 22, 31, 0.4)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.15\)/g, 'rgba(20, 22, 31, 0.15)');

  // 8. Update solid layouts
  content = content.replace(/backgroundColor:\s*'#ffffff'/g, "backgroundColor: '#14161F'");
  content = content.replace(/backgroundColor:\s*'#F3F4F6'/g, "backgroundColor: '#090A0F'");
  content = content.replace(/backgroundColor:\s*'#F9FAFB'/g, "backgroundColor: '#101116'");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully refurbished styles, colors and layers in ${fileRelPath}`);
});
