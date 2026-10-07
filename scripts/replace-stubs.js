const fs = require('fs');
const path = require('path');

const dummyCode = `
const dummyFn = (...args: any[]) => ({});
const doc = dummyFn;
const getDoc = dummyFn;
const updateDoc = dummyFn;
const setDoc = dummyFn;
const arrayUnion = dummyFn;
const arrayRemove = dummyFn;
const query = dummyFn;
const collection = dummyFn;
const orderBy = dummyFn;
const limit = dummyFn;
const increment = dummyFn;
const getDocs = async () => ({ docs: [] });
const serverTimestamp = () => new Date();
const addDoc = dummyFn;
const where = dummyFn;
const deleteDoc = dummyFn;
const Timestamp = { now: () => ({ toMillis: () => Date.now() }), fromDate: (d: any) => ({ toMillis: () => d.getTime() }) };
const createUserWithEmailAndPassword = dummyFn;
const updateProfile = dummyFn;
const signInWithEmailAndPassword = dummyFn;
`;

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
  if (content.includes('@/lib/firebaseStubs')) {
    content = content.replace(/import \{[\s\S]*?\} from '@\/lib\/firebaseStubs';/g, dummyCode);
    fs.writeFileSync(file, content);
    count++;
  }
});
console.log(`Replaced in ${count} files.`);
