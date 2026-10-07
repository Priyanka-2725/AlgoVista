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
  
  // The regex to find leftover useMemoFirebase logic:
  // e.g. const activitiesQuery = null => { ... }, [user, db]);
  content = content.replace(/const\s+\w+\s*=\s*null\s*=>\s*\(?[\s\S]*?,\s*\[.*?\]\);/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log('Fixed syntax in ' + file);
  }
});
console.log('Total files fixed: ' + changedFiles);
