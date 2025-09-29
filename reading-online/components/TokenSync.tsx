// components/TokenSync.tsx
'use client';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TokenSync() {
  const { token } = useAuth();
  
  useEffect(() => {
    if (token) {
      // Sync token to cookies for server-side access
      document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=strict`;
    } else {
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }, [token]);
  
  return null;
}
