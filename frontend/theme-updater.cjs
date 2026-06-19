const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // Typography
  { regex: /text-custom-choco\/([0-9]+)/g, replace: 'text-secondary' }, // approximations
  { regex: /text-custom-choco/g, replace: 'text-primary' },
  { regex: /text-custom-ochre/g, replace: 'text-accent' },
  { regex: /text-custom-rose/g, replace: 'text-error' },
  
  // Backgrounds
  { regex: /bg-custom-cream\/([0-9]+)\s+backdrop-blur/g, replace: 'glass-navbar' },
  { regex: /bg-custom-cream/g, replace: 'bg-background' },
  { regex: /bg-custom-sand/g, replace: 'bg-surface' },
  { regex: /bg-custom-ochre/g, replace: 'bg-primary' },
  { regex: /bg-custom-yellow\/([0-9]+)/g, replace: 'bg-white/5' },
  { regex: /bg-custom-yellow/g, replace: 'bg-secondary' },
  { regex: /bg-custom-rose/g, replace: 'bg-error' },
  
  // Borders
  { regex: /border-custom-choco\/([0-9]+)/g, replace: 'border-white/10' },
  { regex: /border-custom-ochre\/([0-9]+)/g, replace: 'border-accent/30' },
  
  // Gradients
  { regex: /from-brand-600 to-custom-rose/g, replace: 'from-primary to-accent' },
  { regex: /selection:bg-brand-500/g, replace: 'selection:bg-primary' },
  { regex: /bg-brand-[0-9]+/g, replace: 'bg-primary' },
  { regex: /text-brand-[0-9]+/g, replace: 'text-primary' },
  
  // Specific layout adjustments for glassmorphism
  { regex: /shadow-md/g, replace: 'shadow-lg shadow-primary/20' },
  { regex: /shadow-sm/g, replace: 'shadow-md shadow-black/40' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { regex, replace } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Class replacement complete.');
