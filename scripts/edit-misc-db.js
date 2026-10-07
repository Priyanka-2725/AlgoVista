const fs = require('fs');

function removeDbDeps(file) {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf-8');
  
  c = c.replace(/if \(!user \|\| !db\) return;/g, "if (!user) return;");
  c = c.replace(/if \(!user \|\| !db \|\| !userData\) return;/g, "if (!user || !userData) return;");
  c = c.replace(/if \(!user \|\| !firestore\) return;/g, "if (!user) return;");
  
  c = c.replace(/const db = useFirestore\(\);\n?/g, "");
  c = c.replace(/const firestore = useFirestore\(\);\n?/g, "");
  c = c.replace(/import \{.*?useFirestore.*?\}.*?;/g, (match) => {
    let rep = match.replace(/useFirestore,? ?/, '');
    if (rep.includes('import {  }')) return '';
    return rep;
  });
  
  c = c.replace(/const userRef = useMemoFirebase.*?;\n?/g, "");
  c = c.replace(/const userRef = doc\(db,.*?\);\n?/g, "");
  c = c.replace(/const q = useMemoFirebase.*?;\n?/g, "");
  c = c.replace(/const \{ data: userData.*?\} = useDoc\(userRef\);\n?/g, "const userData = user; // fallback");
  
  // Specific fallbacks to mock or skip api calls
  c = c.replace(/await updateDoc\(.*?\{/g, "await apiClient.post('/api/users/update', {");
  
  fs.writeFileSync(file, c);
}

const files = [
  'src/features/profile/components/ProfileHeader.tsx',
  'src/features/profile/components/EditProfileModal.tsx',
  'src/features/ai-mentor/components/AIMentorPanel.tsx',
  'src/components/ui/XPHistoryPopover.tsx',
  'src/app/(main)/profile/page.tsx',
  'src/app/(auth)/signup/page.tsx'
];

files.forEach(removeDbDeps);
console.log('Fixed profile/auth/history db refs');
