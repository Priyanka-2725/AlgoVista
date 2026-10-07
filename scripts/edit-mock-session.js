const fs = require('fs');
let file = 'src/app/(learning)/interview/mock/page.tsx';
let c = fs.readFileSync(file, 'utf-8');

c = c.replace(/const perf = await analyzeUserPerformance\(db, user\.uid\);/, "const perfReq = await apiClient.get('/api/ai-mentor/performance'); const perf = perfReq.data;");
c = c.replace(/if \(!user \|\| !db\)/g, "if (!user)");
fs.writeFileSync(file, c);

file = 'src/app/(learning)/interview/mock/[sessionId]/page.tsx';
c = fs.readFileSync(file, 'utf-8');

c = c.replace(/const snapshotsRef = collection\(db, 'users', user\.uid, 'mock_interviews', sessionId as string, 'snapshots'\);/g, "");

c = c.replace(/if \(!session \|\| session\.status !== 'active' \|\| !user \|\| !db \|\| !currentProblem\)/g, "if (!session || session.status !== 'active' || !user || !currentProblem)");
c = c.replace(/if \(!sessionRef \|\| isFinalizing \|\| !currentProblem \|\| !user \|\| !db\)/g, "if (isFinalizing || !currentProblem || !user)");
c = c.replace(/if \(user && db\)/g, "if (user)");
c = c.replace(/const userRef = doc\(db, 'users', user\.uid\);/g, "");
c = c.replace(/const sessionRef = apiClient\.post\('\/dashboard\/activities', \{ eventType: 'action' \}\)\.catch\(console\.error\);/g, "");

// fetch session initially
const fetchSessionCode = `useEffect(() => {
    if (sessionId) {
      apiClient.get(\`/api/arena/\${sessionId}\`).then(res => set_session(res.data)).catch(console.error);
    }
  }, [sessionId]);`;

c = c.replace(/const \[session, set_session\] = React\.useState<any>\(null\);/, `const [session, set_session] = React.useState<any>(null);\n  const [isSessionLoading, setIsSessionLoading] = React.useState(true);\n  \n  ${fetchSessionCode}\n  useEffect(() => {\n    if (session) setIsSessionLoading(false);\n  }, [session]);`);

// finalize session
c = c.replace(/const verdict = allPassed \? 'Accepted' : 'Partial\/Incomplete';[\s\S]*?apiClient\.post\('\/dashboard\/activities', \{ eventType: 'action' \}\)\.catch\(console\.error\);[\s\S]*?apiClient\.post\('\/dashboard\/activities', \{ eventType: 'action' \}\)\.catch\(console\.error\);/, `const verdict = allPassed ? 'Accepted' : 'Partial/Incomplete';
      
      const aiFeedback = await getInterviewFeedback({
        problemTitle: currentProblem.title,
        problemDescription: currentProblem.description,
        userCode: code,
        language,
        resultStatus: verdict
      });

      setFeedback(aiFeedback);
      
      await apiClient.post(\`/api/arena/\${sessionId}/complete\`, {
        feedback: aiFeedback,
        submissions: results
      });
`);

fs.writeFileSync(file, c);
console.log('Fixed', file);
