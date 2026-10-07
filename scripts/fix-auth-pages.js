const fs = require('fs');

// Fix Signup
let file = 'src/app/(auth)/signup/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Strip all dummy code
content = content.replace(/\/\* dummy \*\/[\s\S]*?const signInWithEmailAndPassword = dummyFn;/g, '');
content = content.replace(/const dummyFn = \(\.\.\.args: any\[\]\) => \(\{\}\);\\n\/\/ @ts-nocheck/g, '// @ts-nocheck');
content = content.replace(/import \{ useAuth \} from '@\/firebase';/g, 'import { useAuth } from \'@/contexts/AuthContext\';\nimport { apiClient } from \'@/lib/apiClient\';');
content = content.replace(/import \{.*?\} from '@\/lib\/firebaseStubs';/g, '');

const signupImpl = `
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/register', { name, email, password });
      auth.login(res.data.token, res.data.user);
      
      toast({
        title: "Account Created",
        description: "Welcome to Algo Vista! Your unique avatar has been generated.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false);
    }
  };
`;

content = content.replace(/setLoading\(true\);[\s\S]*?setLoading\(false\);\n    }\n  };/, signupImpl.trim());
fs.writeFileSync(file, content);

// Fix Login
file = 'src/app/(auth)/login/page.tsx';
if (fs.existsSync(file)) {
  content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/\/\* dummy \*\/[\s\S]*?const signInWithEmailAndPassword = dummyFn;/g, '');
  content = content.replace(/import \{ useAuth \} from '@\/firebase';/g, 'import { useAuth } from \'@/contexts/AuthContext\';\nimport { apiClient } from \'@/lib/apiClient\';');
  
  const loginImpl = `
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/login', { email, password });
      auth.login(res.data.token, res.data.user);
      
      toast({
        title: "Welcome Back",
        description: "Successfully logged in.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  `;
  
  content = content.replace(/setLoading\(true\);[\s\S]*?setLoading\(false\);\n    }\n  };/, loginImpl.trim());
  fs.writeFileSync(file, content);
}

console.log('Fixed auth pages');
