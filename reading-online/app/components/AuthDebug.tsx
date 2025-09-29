'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthDebug() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50">
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>User: {user?.userName || 'None'}</div>
      <div>Token: {token ? 'Present' : 'None'}</div>
    </div>
  );
}