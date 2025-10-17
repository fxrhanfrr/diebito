'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { UserProfileSetup } from './UserProfileSetup';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'doctor' | 'patient' | 'restaurant_owner';
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-xl font-semibold">You're not signed in</div>
          <p className="text-gray-600">Redirecting to login...</p>
          <a
            href="/auth/login"
            className="inline-block px-4 py-2 rounded-md bg-black text-white hover:opacity-90"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Show profile setup if user is authenticated but doesn't have a profile
  if (requireAuth && isAuthenticated && !user) {
    return <UserProfileSetup />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-xl font-semibold">Access denied</div>
          <p className="text-gray-600">You do not have permission to view this page.</p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 rounded-md bg-black text-white hover:opacity-90"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}