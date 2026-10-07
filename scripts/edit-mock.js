const fs = require('fs');
const file = 'src/app/(learning)/interview/mock/page.tsx';
let c = fs.readFileSync(file, 'utf-8');

c = c.replace(/const sessionRef = apiClient\.post\('\/dashboard\/activities', \{ eventType: 'action' \}\)\.catch\(console\.error\);/g, "");

c = c.replace(/const sessionData = \{[\s\S]*?createdAt: serverTimestamp\(\)\n\s*\};/, '');

c = c.replace(/router\.push\(`\/interview\/mock\/\$\{sessionRef\.id\}`\);/, `const arenaReq = await apiClient.post('/api/arena/start', {
        problemIds,
        weakTopicSelected: weakCategory
      });
      router.push(\`/interview/mock/\${arenaReq.data._id}\`);`);

fs.writeFileSync(file, c);
console.log('Fixed', file);
