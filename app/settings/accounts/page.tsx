'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMultiAccount } from '@/hooks/useMultiAccount';
import AccountSwitcher from '@/components/AccountSwitcher';
import { 
  Users, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Plus, 
  Trash2, 
  ArrowRightLeft,
  AlertCircle,
  Info,
  Clock
} from 'lucide-react';
import AuthGuard from '@/components/EnhancedAuthGuard';

export default function MultiAccountPage() {
  const { 
    currentAccount, 
    deviceAccounts, 
    switchAccount, 
    removeAccount, 
    deviceInfo,
    loading 
  } = useMultiAccount();
  
  const [switching, setSwitching] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'patient': return 'bg-green-100 text-green-800';
      case 'restaurant_owner': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'doctor': return 'Doctor';
      case 'patient': return 'Patient';
      case 'restaurant_owner': return 'Restaurant Owner';
      default: return role;
    }
  };

  const getDeviceIcon = () => {
    const deviceName = deviceInfo.deviceName.toLowerCase();
    if (deviceName.includes('mobile')) return <Smartphone className="h-5 w-5" />;
    if (deviceName.includes('tablet')) return <Tablet className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  const handleSwitchAccount = async (accountId: string) => {
    setSwitching(accountId);
    try {
      await switchAccount(accountId);
    } finally {
      setSwitching(null);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to remove this account from this device? This will not delete the account, just remove it from this device.')) return;
    
    setRemoving(accountId);
    try {
      await removeAccount(accountId);
    } finally {
      setRemoving(null);
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

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-2xl">
            <CardContent className="pt-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading accounts...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Multi-Account Management</h1>
            <p className="mt-2 text-gray-600">
              Manage multiple accounts on this device and switch between them seamlessly
            </p>
          </div>

          {/* Quick Switcher */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Quick Account Switcher
                </CardTitle>
                <CardDescription>
                  Switch between accounts without logging out
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccountSwitcher />
              </CardContent>
            </Card>
          </div>

          {/* Device Information */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getDeviceIcon()}
                  <span className="ml-2">Device Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="font-medium text-gray-500">Device Type</div>
                    <div className="text-lg font-semibold">{deviceInfo.deviceName}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-500">Device ID</div>
                    <div className="text-sm font-mono text-gray-600">{deviceInfo.deviceId}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-500">Active Accounts</div>
                    <div className="text-lg font-semibold">{deviceInfo.accountCount}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accounts List */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Active Accounts</h2>
            <div className="space-y-4">
              {deviceAccounts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Accounts</h3>
                    <p className="text-gray-600">
                      You don't have any accounts on this device yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                deviceAccounts.map((account) => (
                  <Card key={account.id} className={`${account.id === currentAccount?.id ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold">
                              {account.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{account.name}</div>
                            <div className="text-gray-600">{account.email}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getRoleColor(account.role)}>
                                {getRoleLabel(account.role)}
                              </Badge>
                              {account.id === currentAccount?.id && (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  Current Account
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Last login: {formatDate(account.lastLogin)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {account.id !== currentAccount?.id && (
                            <Button
                              variant="outline"
                              onClick={() => handleSwitchAccount(account.id)}
                              disabled={switching === account.id}
                            >
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                              {switching === account.id ? 'Switching...' : 'Switch'}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => handleRemoveAccount(account.id)}
                            disabled={removing === account.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {removing === account.id ? 'Removing...' : 'Remove'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Multi-Account Benefits */}
          <div className="mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Info className="h-5 w-5 mr-2" />
                  Multi-Account Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Quick Switching</div>
                      <div className="text-sm text-blue-700">
                        Switch between accounts without logging out and back in
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Persistent Sessions</div>
                      <div className="text-sm text-blue-700">
                        Each account maintains its own session and data
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Role Management</div>
                      <div className="text-sm text-blue-700">
                        Manage different roles (Patient, Doctor, Admin) on one device
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Monitor className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Device-Specific</div>
                      <div className="text-sm text-blue-700">
                        Accounts are tied to this device for security
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-900">Security Notice</div>
                  <div className="text-sm text-yellow-700 mt-1">
                    Multi-account sessions are device-specific. Removing an account only removes it from this device, 
                    not from the system. Always sign out from shared devices when finished.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
