const fs = require('fs');

let f = 'src/features/profile/components/ProfileHeader.tsx';
let c = fs.readFileSync(f, 'utf-8');
c = c.replace(/"use client"/g, '');
c = c.replace(/'use client';\n?/g, '');
c = "'use client';\n" + c;
fs.writeFileSync(f, c);

f = 'src/features/learning/services/difficultyAdapter.ts';
c = fs.readFileSync(f, 'utf-8');
c = c.replace(/"use client"/g, '');
c = c.replace(/'use client';\n?/g, '');
c = "'use client';\n" + c;
fs.writeFileSync(f, c);
