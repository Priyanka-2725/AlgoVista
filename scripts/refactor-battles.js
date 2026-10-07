const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // 1. Replace Firebase imports
  content = content.replace(/import\s+\{\s*[^}]*\s*\}\s+from\s+['"]@\/firebase['"];?/g, "import { useUser } from '@/contexts/AuthContext';\nimport { apiClient } from '@/lib/apiClient';");
  content = content.replace(/import\s+\{\s*[^}]*\s*\}\s+from\s+['"]@\/lib\/firebaseStubs['"];?/g, '');
  
  // Clean up duplicate imports if any
  content = content.replace(/(import { useUser } from '@\/contexts\/AuthContext';\s*)+/g, "import { useUser } from '@/contexts/AuthContext';\n");
  content = content.replace(/(import { apiClient } from '@\/lib\/apiClient';\s*)+/g, "import { apiClient } from '@/lib/apiClient';\n");

  // 2. Remove hooks initialization
  content = content.replace(/const\s+db\s*=\s*useFirestore\(\);?/g, '');
  content = content.replace(/const\s+firestore\s*=\s*useFirestore\(\);?/g, '');
  content = content.replace(/const\s+\w+Ref\s*=\s*useMemoFirebase\([^;]+;?/g, '');
  content = content.replace(/const\s+\w+Query\s*=\s*useMemoFirebase\([^;]+;?/g, '');
  
  // 3. Replace useDoc with dummy state
  content = content.replace(/const\s+\{\s*data\s*:\s*([^,]+)\s*(?:,\s*isLoading(?:\s*:\s*\w+)?\s*)?\}\s*=\s*useDoc\([^)]+\);?/g, 'const [$1, set_$1] = React.useState<any>(null);');
  content = content.replace(/const\s+\{\s*data\s*:\s*([^,]+)\s*(?:,\s*isLoading(?:\s*:\s*\w+)?\s*)?\}\s*=\s*useCollection\([^)]+\);?/g, 'const [$1, set_$1] = React.useState<any[]>([]);');

  // 4. Replace writes with dummy API calls
  content = content.replace(/(?:await\s+)?setDoc\([^;]+\);?/g, "apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);");
  content = content.replace(/(?:await\s+)?addDoc\([^;]+\);?/g, "apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);");
  content = content.replace(/(?:await\s+)?updateDoc\([^;]+\);?/g, "apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);");
  
  // 5. Remove lingering db arguments in function calls
  content = content.replace(/incrementDailySolveCount\(\s*db\s*,\s*/g, 'incrementDailySolveCount(');
  content = content.replace(/adaptDifficulty\(\s*db\s*,\s*/g, 'adaptDifficulty(');
  content = content.replace(/completeLearningStep\(\s*db\s*,\s*[^,]+,\s*/g, 'completeLearningStep(');

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Processed:', filePath);
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
console.log('Done!');
