// Centralized exports to replace the old firebase directory
export * from '@/contexts/AuthContext';

import React from 'react';

export const useMemoFirebase = (cb: any, deps: any[]) => React.useMemo(cb, deps);
export const useFirebase = () => null;
export const useFirestore = () => ({});
export const useDoc = (ref: any) => {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(() => {
    if (ref && ref.path.includes('users')) {
      // Return dummy user profile data
      setData({ battleEnergy: 10, problemsSolved: 0, xp: 0, lastEnergyUpdate: new Date().toISOString() });
    } else {
      setData({});
    }
  }, [ref]);
  return { data, isLoading: false };
};
export const useCollection = () => ({ data: [], isLoading: false });
