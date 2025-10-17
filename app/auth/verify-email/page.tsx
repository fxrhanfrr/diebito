'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const { user, loading, error, clearError } = useEnhancedAuth();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Redirect if already verified
  useEffect(() => {
    if (user?.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Check verification status periodically
  useEffect(() => {
    if (!user || user.emailVerified) return;

    const checkVerification = async () => {
      setCheckingVerification(true);
      try {
        await user.reload();
        if (user.emailVerified) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      } finally {
        setCheckingVerification(false);
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkVerification, 5000);

    return () => clearInterval(interval);
  }, [user, router]);

  const handleResendVerification = async () => {
    if (!user) return;

    setIsResending(true);
    setResendSuccess(false);
    clearError();

    try {
      await user.sendEmailVerification();
      setResendSuccess(true);
    } catch (error) {
      console.error('Error resending verification:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Not Signed In</h2>
            <p className="text-gray-600 mb-4">Please sign in to verify your email.</p>
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-4">Your email has been successfully verified.</p>
            <Button onClick={handleGoToDashboard} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <strong>{user.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resendSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Verification email sent! Please check your inbox.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Click the link in the email to verify your account. The page will automatically refresh once verified.
            </p>

            {checkingVerification && (
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Checking verification status...</span>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>

              <Button
                onClick={handleGoToDashboard}
                variant="ghost"
                className="w-full"
              >
                Continue Anyway
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
