const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
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

let count = 0;
const files = walk('src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.match(/['"]use client['"];/)) {
    let newContent = content.replace(/['"]use client['"];\s*/g, '');
    if (newContent !== content) {
      newContent = "'use client';\n" + newContent;
      fs.writeFileSync(file, newContent);
      count++;
    }
  }
});
console.log(`Moved 'use client' in ${count} files.`);
