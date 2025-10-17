'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useMultiAccount } from '@/hooks/useMultiAccount';
import { 
  User, 
  Users, 
  LogOut, 
  Plus, 
  Trash2, 
  ArrowRightLeft, 
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

export default function AccountSwitcher() {
  const { 
    currentAccount, 
    deviceAccounts, 
    switchAccount, 
    removeAccount, 
    isMultiAccount,
    deviceInfo,
    switching 
  } = useMultiAccount();
  
  const [showAccountManager, setShowAccountManager] = useState(false);
  const [removingAccount, setRemovingAccount] = useState<string | null>(null);

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
    if (deviceName.includes('mobile')) return <Smartphone className="h-4 w-4" />;
    if (deviceName.includes('tablet')) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const handleSwitchAccount = async (accountId: string) => {
    const success = await switchAccount(accountId);
    if (success) {
      setShowAccountManager(false);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to remove this account from this device?')) return;
    
    setRemovingAccount(accountId);
    try {
      await removeAccount(accountId);
    } finally {
      setRemovingAccount(null);
    }
  };

  if (!currentAccount) {
    return (
      <Button variant="outline" size="sm">
        <User className="h-4 w-4 mr-2" />
        No Account
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Quick Account Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentAccount.profilePicture} alt={currentAccount.name} />
              <AvatarFallback className="text-xs">
                {currentAccount.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{currentAccount.name}</span>
            <Badge className={getRoleColor(currentAccount.role)}>
              {getRoleLabel(currentAccount.role)}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center space-x-2">
            {getDeviceIcon()}
            <span className="text-sm text-gray-500">{deviceInfo.deviceName}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {deviceAccounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              onClick={() => handleSwitchAccount(account.id)}
              disabled={switching}
              className="flex items-center space-x-3 p-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={account.profilePicture} alt={account.name} />
                <AvatarFallback>
                  {account.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{account.name}</div>
                <div className="text-sm text-gray-500 truncate">{account.email}</div>
                <Badge className={getRoleColor(account.role)} size="sm">
                  {getRoleLabel(account.role)}
                </Badge>
              </div>
              {account.id === currentAccount.id && (
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowAccountManager(true)}>
            <Users className="h-4 w-4 mr-2" />
            Manage Accounts
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Account Manager Dialog */}
      <Dialog open={showAccountManager} onOpenChange={setShowAccountManager}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Account Manager</span>
            </DialogTitle>
            <DialogDescription>
              Manage multiple accounts on this device. You can switch between accounts without logging out.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Device Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  {getDeviceIcon()}
                  <span>Device Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-500">Device</div>
                    <div className="text-gray-900">{deviceInfo.deviceName}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-500">Accounts</div>
                    <div className="text-gray-900">{deviceInfo.accountCount} active</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accounts List */}
            <div className="space-y-3">
              <h3 className="font-medium">Active Accounts</h3>
              {deviceAccounts.map((account) => (
                <Card key={account.id} className={`${account.id === currentAccount.id ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={account.profilePicture} alt={account.name} />
                          <AvatarFallback>
                            {account.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-gray-500">{account.email}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRoleColor(account.role)} size="sm">
                              {getRoleLabel(account.role)}
                            </Badge>
                            {account.id === currentAccount.id && (
                              <Badge variant="outline" size="sm">
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {account.id !== currentAccount.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSwitchAccount(account.id)}
                            disabled={switching}
                          >
                            <ArrowRightLeft className="h-4 w-4 mr-1" />
                            Switch
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveAccount(account.id)}
                          disabled={removingAccount === account.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Multi-account benefits */}
            {isMultiAccount && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Multi-Account Active</div>
                      <div className="text-sm text-blue-700">
                        You can switch between {deviceAccounts.length} accounts without logging out. 
                        Each account maintains its own session and data.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
