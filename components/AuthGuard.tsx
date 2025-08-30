'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { UserProfileSetup } from './UserProfileSetup';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'doctor' | 'patient';
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  requiredRole 
}: AuthGuardProps) {
  const { user, firebaseUser, loading, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, isAuthenticated, loading, requireAuth, requiredRole, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Show profile setup if user is authenticated but doesn't have a profile
  if (requireAuth && isAuthenticated && !user) {
    return <UserProfileSetup />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}