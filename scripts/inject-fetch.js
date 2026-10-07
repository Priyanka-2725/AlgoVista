const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  if (content.includes('const [userData , set_userData ] = React.useState<any>(null);') && !content.includes('apiClient.get(\'/users/profile\')')) {
    const fetchCode = `
  React.useEffect(() => {
    if (user) {
      apiClient.get('/users/profile').then(res => set_userData(res.data)).catch(console.error);
    }
  }, [user]);
`;
    content = content.replace('const [userData , set_userData ] = React.useState<any>(null);', 'const [userData , set_userData ] = React.useState<any>(null);\n' + fetchCode);
  }

  // Also fix history fetching
  if (content.includes('const [rawHistory , set_rawHistory ] = React.useState<any[]>([]);') && !content.includes('apiClient.get(\'/battles/history\')')) {
    const fetchCode = `
  React.useEffect(() => {
    if (user) {
      apiClient.get('/battles/history').then(res => set_rawHistory(res.data)).catch(console.error);
    }
  }, [user]);
`;
    content = content.replace('const [rawHistory , set_rawHistory ] = React.useState<any[]>([]);', 'const [rawHistory , set_rawHistory ] = React.useState<any[]>([]);\n' + fetchCode);
  }

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed:', filePath);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

const targetDirs = [
  path.join(__dirname, 'src/app/(learning)/battles'),
  path.join(__dirname, 'src/app/(learning)/interview'),
  path.join(__dirname, 'src/app/(learning)/leaderboard'),
  path.join(__dirname, 'src/app/(learning)/sprint')
];

targetDirs.forEach(walk);
console.log('Injection done!');
