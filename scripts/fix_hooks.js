const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace imports
  content = content.replace(/import\s*\{([^}]*)\buseUser\b([^}]*)\}\s*from\s*['"]@\/contexts\/AuthContext['"]/g, 
    'import {$1useAuth$2} from \'@/contexts/AuthContext\'');
  
  // Replace hook calls
  content = content.replace(/\buseUser\(\)/g, 'useAuth()');
  
  // Replace useFirebase, useDoc, useCollection with {} or similar to avoid breaking destructuring
  content = content.replace(/useFirebase\(\)/g, '({ firestore: null, logout: async () => {} })');
  content = content.replace(/useDoc\([^)]*\)/g, '({ data: null, isLoading: false, error: null })');
  content = content.replace(/useCollection\([^)]*\)/g, '({ data: [], isLoading: false, error: null })');
  content = content.replace(/useMemoFirebase\([^)]*\)/g, 'null');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log('Migrated hooks in ' + file);
  }
});
console.log('Total files migrated: ' + changedFiles);
