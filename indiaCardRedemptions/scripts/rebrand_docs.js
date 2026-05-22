const fs = require('fs');
const path = require('path');

const targetDocs = [
  'MASTER_PROMPT.md',
  'AGENT_INSTRUCTIONS.md',
  'README.md',
  'docs/reference/tech_stack.md',
  'docs/reference/implementation_strategy.md',
  'docs/reference/features_brochure_may_2026.md',
  'docs/reference/features.md'
];

targetDocs.forEach(fileRelPath => {
  const filePath = path.resolve(__dirname, '..', fileRelPath);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${fileRelPath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Rebrand names
  content = content.replace(/AwardHack India/gi, 'The Points Array');
  content = content.replace(/AwardHack/gi, 'The Points Array');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully rebranded ${fileRelPath}`);
});
