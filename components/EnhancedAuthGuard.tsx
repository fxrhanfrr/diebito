'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { UserProfileSetup } from './UserProfileSetup';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Shield, Clock } from 'lucide-react';

interface EnhancedAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'doctor' | 'patient' | 'restaurant_owner';
  requireEmailVerification?: boolean;
  fallbackUrl?: string;
}

export default function EnhancedAuthGuard({ 
  children, 
  requireAuth = true, 
  requiredRole,
  requireEmailVerification = false,
  fallbackUrl = '/auth/login'
}: EnhancedAuthGuardProps) {
  const { user, profile, loading, error, signOut } = useEnhancedAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && requireAuth) {
      // Check authentication
      if (!user) {
        setRedirecting(true);
        router.push(fallbackUrl);
        return;
      }

      // Check email verification if required
      if (requireEmailVerification && !user.emailVerified) {
        setRedirecting(true);
        router.push('/auth/verify-email');
        return;
      }

      // Check role authorization
      if (requiredRole && profile?.role !== requiredRole) {
        setRedirecting(true);
        router.push('/dashboard');
        return;
      }

      setRedirecting(false);
    }
  }, [user, profile, loading, requireAuth, requiredRole, requireEmailVerification, fallbackUrl, router]);

  // Show loading state
  if (loading || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {loading ? 'Loading...' : 'Redirecting...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Retry
              </Button>
              <Button 
                onClick={() => signOut()}
                className="flex-1"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show not authenticated state
  if (requireAuth && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">
              You need to sign in to access this page.
            </p>
            <Button 
              onClick={() => router.push(fallbackUrl)}
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show email verification required
  if (requireEmailVerification && user && !user.emailVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Email Verification Required</h2>
            <p className="text-gray-600 mb-4">
              Please verify your email address to continue.
            </p>
            <Button 
              onClick={() => router.push('/auth/verify-email')}
              className="w-full"
            >
              Verify Email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show role authorization required
  if (requiredRole && profile?.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page. Required role: {requiredRole}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => signOut()}
                className="flex-1"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show profile setup if user is authenticated but doesn't have a profile
  if (requireAuth && user && !profile) {
    return <UserProfileSetup />;
  }

  // Show session timeout warning (optional)
  const SessionTimeoutWarning = () => {
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
      if (!user) return;

      // Show warning 5 minutes before session expires (assuming 30 min session)
      const warningTime = 25 * 60 * 1000; // 25 minutes
      const timer = setTimeout(() => {
        setShowWarning(true);
      }, warningTime);

      return () => clearTimeout(timer);
    }, [user]);

    if (!showWarning) return null;

    return (
      <div className="fixed top-4 right-4 z-50">
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Your session will expire soon. Click to extend.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <>
      <SessionTimeoutWarning />
      {children}
    </>
  );
}
