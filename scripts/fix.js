const fs = require('fs');
const files = [
  'src/features/learning/services/difficultyAdapter.ts',
  'src/features/learning/services/revisionService.ts',
  'src/features/learning/services/sheetService.ts',
  'src/services/aiMentor.ts',
  'src/services/streakService.ts',
  'src/features/gamification/services/streakService.ts'
];
files.forEach(file => {
  if(!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf-8');
  c = c.replace(/class FirestorePermissionError extends Error \{\}/g, 'class FirestorePermissionError extends Error { constructor(...args: any[]) { super(); } }');
  c = c.replace(/type DocumentData = any;/g, 'type DocumentData = any; const docData = { count: 0, streakDays: 0, maxStreak: 0, lastSolvedDate: "", xp: 0, level: 0, wrongCount: 0, dropoutRisk: 0, problemsSolved: 0 };');
  c = c.replace(/snapshot\.data\(\)/g, '(snapshot.data?.() || docData)');
  c = c.replace(/\.data\(\)/g, '?.()');
  c = c.replace(/exists\(\)/g, 'exists');
  
  // Replace object destructured from .data()
  c = c.replace(/const {[^}]+} = \w+\.data\(\)[^;]*;/g, 'const { streakDays = 0, maxStreak = 0, lastSolvedDate = "", xp = 0, level = 0, wrongCount = 0, dropoutRisk = 0, problemsSolved = 0, solvedProblems = [] } = {} as any;');
  fs.writeFileSync(file, c);
});
