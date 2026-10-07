'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Subject Mastery Redirector
 * Unifying Interview Subjects into the main Learning Hub.
 */
export default function SubjectsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/learn');
  }, [router]);

  return null;
}
