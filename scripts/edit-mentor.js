const fs = require('fs');
const file = 'src/features/ai-mentor/components/AIMentorPanel.tsx';
let c = fs.readFileSync(file, 'utf-8');

if (!c.includes('apiClient')) {
  c = c.replace(/import \{ cn \} from '@\/lib\/utils';/, "import { cn } from '@/lib/utils';\nimport { apiClient } from '@/lib/apiClient';");
}

c = c.replace(/const perf = await analyzeUserPerformance\(db, user\.uid\);/, `const perfReq = await apiClient.get('/api/ai-mentor/performance');
      const perf = perfReq.data;`);

c = c.replace(/const tasksSnap = await getDocs\([\s\S]*?limit\(3\)\n\s*\)\);[\s]*const pendingTasks = tasksSnap\.docs\.map\(d => d(?:\.data\(\)|\?\.\(\))\?\.title\);/, `const tasksReq = await apiClient.get('/api/todos');
      const pendingTasks = tasksReq.data.slice(0, 3).map((t: any) => t.title);`);

// the fallback if regex fails
c = c.replace(/const tasksSnap = await getDocs[\s\S]*?\.title\);/m, `const tasksReq = await apiClient.get('/api/todos');\n      const pendingTasks = tasksReq.data.slice(0, 3).map((t: any) => t.title);`);

fs.writeFileSync(file, c);
console.log('Fixed', file);
