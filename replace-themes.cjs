const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  { search: /text-white(?![\w\-\/])/g, replace: 'theme-text-main' },
  { search: /hover:text-white/g, replace: 'hover:theme-text-main' },
  { search: /text-neutral-400/g, replace: 'theme-text-muted' },
  { search: /text-neutral-500/g, replace: 'theme-text-muted' },
  { search: /text-neutral-300/g, replace: 'theme-text-sec' },
  { search: /hover:text-neutral-300/g, replace: 'hover:theme-text-main' },
  { search: /bg-neutral-900\/[0-9]+/g, replace: 'theme-bg-card' },
  { search: /bg-neutral-950\/[0-9]+/g, replace: 'theme-bg-panel' },
  { search: /bg-neutral-900/g, replace: 'theme-bg-card' },
  { search: /bg-neutral-950/g, replace: 'theme-bg-panel' },
  { search: /bg-black\/[0-9]+/g, replace: 'theme-bg-app' },
  { search: /bg-black(?![A-Za-z0-9\-\/])/g, replace: 'theme-bg-app' },
  { search: /border-white\/[0-9]+/g, replace: 'theme-border' },
  { search: /border-neutral-800\/[0-9]+/g, replace: 'theme-border' },
  { search: /border-neutral-700/g, replace: 'theme-border' },
  { search: /border-neutral-800/g, replace: 'theme-border' },
  { search: /bg-white\/5(?!0)/g, replace: 'theme-bg-hover' },
  { search: /bg-white\/10/g, replace: 'theme-bg-hover' },
  { search: /text-white\/[0-9]+/g, replace: 'theme-text-muted' },
];

walk('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    replacements.forEach(({ search, replace }) => {
      content = content.replace(search, replace);
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
