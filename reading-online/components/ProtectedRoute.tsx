
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Reader' | 'Admin';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check role if required
      if (requiredRole && user) {
        const userRole = user.roleId === 1 ? 'Reader' : user.roleId === 2 ? 'Admin' : 'Unknown';
        if (userRole !== requiredRole) {
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user) {
    const userRole = user.roleId === 1 ? 'Reader' : user.roleId === 2 ? 'Admin' : 'Unknown';
    if (userRole !== requiredRole) {
      return null;
    }
  }

  return <>{children}</>;
};