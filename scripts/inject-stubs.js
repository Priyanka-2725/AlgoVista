const fs = require('fs');
const files = [
  'src/features/learning/services/difficultyAdapter.ts',
  'src/features/learning/services/revisionService.ts',
  'src/features/learning/services/sheetService.ts',
  'src/services/aiMentor.ts',
  'src/services/streakService.ts',
  'src/features/gamification/services/streakService.ts',
  'src/features/profile/components/ProfileHeader.tsx'
];

files.forEach(file => {
  if(!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf-8');
  
  // Clean up any old stubbing
  c = c.replace(/import { apiClient } from '@\/lib\/apiClient';\n/g, '');
  
  const inject = `
import { 
  doc, getDoc, updateDoc, setDoc, arrayUnion, 
  query, collection, orderBy, limit, increment, 
  getDocs, serverTimestamp, addDoc
} from '@/lib/firebaseStubs';
type Firestore = any;
type DocumentData = any;
class FirestorePermissionError extends Error {}
const errorEmitter = { emit: () => {} };
`;
  
  // We'll insert it after the other imports
  c = inject + c;
  
  fs.writeFileSync(file, c);
  console.log('Fixed', file);
});
