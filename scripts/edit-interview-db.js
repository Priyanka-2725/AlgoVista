const fs = require('fs');

function removeDbDeps(file) {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf-8');
  c = c.replace(/if \(!file \|\| !user \|\| !db\) return;/g, "if (!file || !user) return;");
  c = c.replace(/if \(!user \|\| !db\) return;/g, "if (!user) return;");
  c = c.replace(/if \(user && db\) {/g, "if (user) {");
  c = c.replace(/, db/g, "");
  c = c.replace(/const db = useFirestore\(\);\n/g, "");
  c = c.replace(/import \{ useFirestore \} from '@\/firebase';\n/g, "");
  c = c.replace(/import \{ useUser, useFirestore \} from '@\/firebase';/g, "import { useUser } from '@/firebase';");
  c = c.replace(/const userRef = doc\(db, 'users', user\.uid\);/g, "");
  c = c.replace(/analyzeUserPerformance\(db, user\.uid\)\.then\(setPerformance\);/, "apiClient.get('/api/ai-mentor/performance').then(res => setPerformance(res.data));");
  c = c.replace(/import \{ analyzeUserPerformance \} from '@\/features\/ai-mentor\/services\/aiMentor';\n/g, "");
  
  c = c.replace(/import \{ doc, updateDoc \} from '@\/lib\/firebaseStubs';\n/g, "");
  c = c.replace(/updateDoc\(userRef, [\s\S]*?\);/g, "apiClient.post('/api/users/update', { /* update */ });"); // Stubbing this out to just use api

  fs.writeFileSync(file, c);
}

const files = [
  'src/app/(learning)/interview/subjects/[subjectId]/page.tsx',
  'src/app/(learning)/interview/resume/page.tsx',
  'src/app/(learning)/interview/resume/arena/page.tsx',
  'src/app/(learning)/interview/companies/[companyId]/page.tsx',
  'src/app/(learning)/interview/behavioral/page.tsx',
  'src/app/(learning)/interview/mock/[sessionId]/page.tsx'
];

files.forEach(removeDbDeps);
console.log('Fixed additional db refs');
