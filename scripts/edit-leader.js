const fs = require('fs');
let f = 'src/app/(learning)/leaderboard/page.tsx';
let c = fs.readFileSync(f, 'utf-8');
c = c.replace('const [leaders , set_leaders ] = React.useState<any[]>([]);', `const [leaders, set_leaders] = React.useState<any[]>([]);
  React.useEffect(() => {
    apiClient.get('/api/leaderboard').then(res => set_leaders(res.data)).catch(console.error);
  }, []);`);
fs.writeFileSync(f, c);
