const fs = require('fs');

function removeDbDeps(file) {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf-8');
  
  c = c.replace(/if \(!user \|\| !db\) return;/g, "if (!user) return;");
  c = c.replace(/if \(!user \|\| !db \|\| !userData\) return;/g, "if (!user || !userData) return;");
  c = c.replace(/if \(!user \|\| !db \|\| !sessionDocId\) return;/g, "if (!user || !sessionDocId) return;");
  c = c.replace(/if \(!user \|\| !db \|\| !selectedProblem \|\| isRunning \|\| isSubmitting\) return;/g, "if (!user || !selectedProblem || isRunning || isSubmitting) return;");
  c = c.replace(/if \(!user \|\| !db \|\| !battleData \|\| isSubmitting\) return;/g, "if (!user || !battleData || isSubmitting) return;");
  c = c.replace(/if \(!user \|\| !db \|\| !userData \|\| status === 'ready'\) return;/g, "if (!user || !userData || status === 'ready') return;");
  c = c.replace(/if \(!user \|\| !db \|\| !roomData \|\| isSubmitting \|\| roomData\.status !== 'active'\) return;/g, "if (!user || !roomData || isSubmitting || roomData.status !== 'active') return;");

  c = c.replace(/if \(db\) \{/g, "{");
  c = c.replace(/, db/g, "");
  c = c.replace(/const db = useFirestore\(\);\n/g, "");
  c = c.replace(/import \{ useFirestore \} from '@\/firebase';\n/g, "");
  c = c.replace(/import \{ useUser, useFirestore(?:,.*?)? \} from '@\/firebase';/g, (match) => {
    return match.replace(/, useFirestore/, '');
  });

  c = c.replace(/const q = query\(collection\(db, 'speedSprintScores'\), where\('userId', '==', user\.uid\)\);/g, "");
  c = c.replace(/const sessionRef = doc\(collection\(db, 'users', user\.uid, 'sprintSessions'\)\);/g, "");
  c = c.replace(/const userRef = doc\(db, 'users', user\.uid\);/g, "");
  c = c.replace(/const qRef = collection\(db, 'queue'\);/g, "");
  c = c.replace(/collection\(db, 'battles'\),/g, "");
  c = c.replace(/const q = query\(collection\(db, 'queue'\), where\('userId', '!=', user\.uid\), limit\(1\)\);/g, "");
  c = c.replace(/await deleteDoc\(doc\(db, 'queue', opponentDocId\)\);/g, "");
  c = c.replace(/const snap = await getDocs\(collection\(db, 'problems'\)\);/g, "");
  c = c.replace(/const daily = await getTodayChallenge\(db\);/g, "const daily = await apiClient.get('/api/daily-challenge').then(res => res.data);");
  c = c.replace(/updateStreak\(db, user\.uid\);/g, "apiClient.post('/api/users/update-streak');");
  c = c.replace(/collection\(db, 'duelRooms'\),/g, "");
  c = c.replace(/collection\(db, 'duelQueue'\),/g, "");
  c = c.replace(/const roomRef = doc\(db, 'duelRooms', roomId\);/g, "");

  fs.writeFileSync(file, c);
}

const files = [
  'src/app/(learning)/battles/sprint/page.tsx',
  'src/app/(learning)/battles/speed-sprint/page.tsx',
  'src/app/(learning)/battles/queue/page.tsx',
  'src/app/(learning)/battles/practice/page.tsx',
  'src/app/(learning)/battles/match/[battleId]/page.tsx',
  'src/app/(learning)/battles/duel/queue/page.tsx',
  'src/app/(learning)/battles/duel/match/[matchId]/page.tsx'
];

files.forEach(removeDbDeps);
console.log('Fixed battles db refs');
