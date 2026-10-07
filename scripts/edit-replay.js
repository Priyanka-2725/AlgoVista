const fs = require('fs');
let file = 'src/app/(learning)/interview/mock/replay/[sessionId]/page.tsx';
let c = fs.readFileSync(file, 'utf-8');

c = c.replace(/const \[session , set_session \] = React\.useState<any>\(null\);/, `const [session, set_session] = React.useState<any>(null);
  const [isSnapsLoading, setIsSnapsLoading] = React.useState(true);
  
  useEffect(() => {
    if (sessionId) {
      apiClient.get(\`/api/arena/\${sessionId}\`).then(res => {
        set_session(res.data);
      }).catch(console.error);
      
      // Mocking snapshots since backend doesn't store them yet
      setTimeout(() => {
        set_snapshots([
          { timestamp: 0, code: '# Start coding here', language: 'python', event: 'start', codeLength: 20 },
          { timestamp: 15000, code: '# Start coding here\\ndef solve():\\n    pass', language: 'python', event: 'typing', codeLength: 40 }
        ]);
        setIsSnapsLoading(false);
      }, 1000);
    }
  }, [sessionId]);`);

fs.writeFileSync(file, c);
console.log('Fixed', file);
