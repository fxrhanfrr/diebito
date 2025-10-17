'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { useEnhancedAuth } from './useEnhancedAuth';
import { multiAccountManager, AccountProfile, DeviceSession } from '@/lib/multiAccount';
import { User } from '@/lib/types';

interface MultiAccountContextType {
  // Current account
  currentAccount: AccountProfile | null;
  isMultiAccount: boolean;
  
  // Account management
  deviceAccounts: AccountProfile[];
  switchAccount: (accountId: string) => Promise<boolean>;
  removeAccount: (accountId: string) => Promise<void>;
  addCurrentAccount: () => Promise<void>;
  
  // Device info
  deviceInfo: { deviceId: string; deviceName: string; accountCount: number };
  
  // Loading states
  loading: boolean;
  switching: boolean;
}

const MultiAccountContext = createContext<MultiAccountContextType | undefined>(undefined);

export const useMultiAccount = () => {
  const context = useContext(MultiAccountContext);
  if (context === undefined) {
    throw new Error('useMultiAccount must be used within a MultiAccountProvider');
  }
  return context;
};

export const MultiAccountProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading: authLoading } = useEnhancedAuth();
  const [currentAccount, setCurrentAccount] = useState<AccountProfile | null>(null);
  const [deviceAccounts, setDeviceAccounts] = useState<AccountProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  // Load device accounts on mount
  useEffect(() => {
    loadDeviceAccounts();
  }, []);

  // Update current account when user changes
  useEffect(() => {
    if (user && profile) {
      updateCurrentAccount();
    } else {
      setCurrentAccount(null);
    }
  }, [user, profile]);

  const loadDeviceAccounts = async () => {
    try {
      setLoading(true);
      const accounts = multiAccountManager.getDeviceAccounts();
      const current = multiAccountManager.getCurrentAccount();
      
      setDeviceAccounts(accounts);
      setCurrentAccount(current);
    } catch (error) {
      console.error('Error loading device accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentAccount = async () => {
    if (!user || !profile) return;

    try {
      // Check if this account is already on device
      const existingAccount = multiAccountManager.getCurrentAccount();
      
      if (existingAccount && existingAccount.userId === user.uid) {
        // Update existing account
        await multiAccountManager.updateAccountProfile(existingAccount.id, {
          name: profile.name,
          role: profile.role,
          profilePicture: user.photoURL || undefined,
          lastLogin: new Date()
        });
        setCurrentAccount(existingAccount);
      } else {
        // Add new account
        const newAccount = await multiAccountManager.addAccount(user, profile);
        setCurrentAccount(newAccount);
      }

      // Reload device accounts
      await loadDeviceAccounts();
    } catch (error) {
      console.error('Error updating current account:', error);
    }
  };

  const switchAccount = useCallback(async (accountId: string): Promise<boolean> => {
    try {
      setSwitching(true);
      
      const account = await multiAccountManager.switchAccount(accountId);
      if (!account) return false;

      setCurrentAccount(account);
      
      // Note: In a real implementation, you would need to handle the actual Firebase auth switch
      // This is a simplified version that just updates the UI state
      // You might need to implement a custom auth flow for this
      
      return true;
    } catch (error) {
      console.error('Error switching account:', error);
      return false;
    } finally {
      setSwitching(false);
    }
  }, []);

  const removeAccount = useCallback(async (accountId: string): Promise<void> => {
    try {
      await multiAccountManager.removeAccount(accountId);
      
      // If removing current account, clear it
      if (currentAccount?.id === accountId) {
        setCurrentAccount(null);
      }
      
      await loadDeviceAccounts();
    } catch (error) {
      console.error('Error removing account:', error);
    }
  }, [currentAccount]);

  const addCurrentAccount = useCallback(async (): Promise<void> => {
    if (!user || !profile) return;

    try {
      await multiAccountManager.addAccount(user, profile);
      await loadDeviceAccounts();
    } catch (error) {
      console.error('Error adding current account:', error);
    }
  }, [user, profile]);

  const deviceInfo = multiAccountManager.getDeviceInfo();
  const isMultiAccount = deviceAccounts.length > 1;

  const value: MultiAccountContextType = {
    currentAccount,
    isMultiAccount,
    deviceAccounts,
    switchAccount,
    removeAccount,
    addCurrentAccount,
    deviceInfo,
    loading: loading || authLoading,
    switching
  };

  return (
    <MultiAccountContext.Provider value={value}>
      {children}
    </MultiAccountContext.Provider>
  );
};
