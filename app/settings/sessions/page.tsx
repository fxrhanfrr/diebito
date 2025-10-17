'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { UserSession } from '@/lib/auth';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Trash2, 
  AlertCircle,
  Shield,
  Clock
} from 'lucide-react';
import AuthGuard from '@/components/EnhancedAuthGuard';

export default function SessionsPage() {
  const { getUserSessions, endUserSession, session, loading } = useEnhancedAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      setError(null);
      const userSessions = await getUserSessions();
      setSessions(userSessions);
    } catch (err) {
      setError('Failed to load sessions');
      console.error('Error loading sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to end this session?')) return;

    try {
      await endUserSession(sessionId);
      await loadSessions(); // Reload sessions
    } catch (err) {
      setError('Failed to end session');
      console.error('Error ending session:', err);
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    const info = deviceInfo.toLowerCase();
    if (info.includes('mobile') || info.includes('android') || info.includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    } else if (info.includes('tablet') || info.includes('ipad')) {
      return <Tablet className="h-5 w-5" />;
    } else {
      return <Monitor className="h-5 w-5" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading || loadingSessions) {
    return (
      <AuthGuard>
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-2xl">
            <CardContent className="pt-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sessions...</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen w-full bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Active Sessions</h1>
            <p className="mt-2 text-gray-600">
              Manage your active sessions across different devices and browsers
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Sessions</h3>
                  <p className="text-gray-600">
                    You don't have any active sessions at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              sessions.map((userSession) => (
                <Card key={userSession.sessionId} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(userSession.deviceInfo)}
                        <div>
                          <CardTitle className="text-lg">
                            {userSession.deviceInfo.split('-')[0] || 'Unknown Device'}
                          </CardTitle>
                          <CardDescription>
                            {userSession.deviceInfo}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {userSession.sessionId === session?.sessionId && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Current Session
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {getTimeAgo(userSession.lastActivity)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-500">Login Time</div>
                        <div className="text-gray-900">
                          {formatDate(userSession.loginTime)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-500">Last Activity</div>
                        <div className="text-gray-900">
                          {formatDate(userSession.lastActivity)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-500">Session ID</div>
                        <div className="text-gray-900 font-mono text-xs">
                          {userSession.sessionId.slice(0, 16)}...
                        </div>
                      </div>
                    </div>

                    {userSession.sessionId !== session?.sessionId && (
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEndSession(userSession.sessionId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          End Session
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Session Timeout</div>
                    <div className="text-sm text-gray-600">
                      Sessions automatically expire after 30 minutes of inactivity
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Secure Connection</div>
                    <div className="text-sm text-gray-600">
                      All sessions use encrypted connections for security
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Suspicious Activity</div>
                    <div className="text-sm text-gray-600">
                      If you notice any unfamiliar sessions, end them immediately
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
