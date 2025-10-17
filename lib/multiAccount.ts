import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from './types';

// Multi-account session management
export interface AccountProfile {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'patient' | 'restaurant_owner';
  profilePicture?: string;
  lastLogin: Date;
  isActive: boolean;
  deviceId: string;
  sessionId: string;
}

export interface DeviceSession {
  deviceId: string;
  deviceName: string;
  accounts: AccountProfile[];
  currentAccountId?: string;
  createdAt: Date;
  lastActivity: Date;
}

export class MultiAccountManager {
  private static instance: MultiAccountManager;
  private deviceId: string;
  private currentSession: DeviceSession | null = null;

  private constructor() {
    this.deviceId = this.generateDeviceId();
    this.loadDeviceSession();
  }

  static getInstance(): MultiAccountManager {
    if (!MultiAccountManager.instance) {
      MultiAccountManager.instance = new MultiAccountManager();
    }
    return MultiAccountManager.instance;
  }

  private generateDeviceId(): string {
    // Generate a persistent device ID based on browser fingerprint
    if (typeof window === 'undefined') return 'server';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('device-fingerprint', 2, 2);
    const fingerprint = canvas.toDataURL();
    
    // Combine with other device characteristics
    const deviceInfo = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      fingerprint.slice(-20)
    ].join('|');
    
    // Create a hash-like ID
    let hash = 0;
    for (let i = 0; i < deviceInfo.length; i++) {
      const char = deviceInfo.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `device_${Math.abs(hash).toString(36)}`;
  }

  private getDeviceName(): string {
    if (typeof window === 'undefined') return 'Server';
    
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Mobile')) {
      return 'Mobile Device';
    } else if (userAgent.includes('Tablet')) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  }

  private async loadDeviceSession(): Promise<void> {
    try {
      const deviceDoc = await getDoc(doc(db, 'device_sessions', this.deviceId));
      if (deviceDoc.exists()) {
        const data = deviceDoc.data();
        this.currentSession = {
          deviceId: data.deviceId,
          deviceName: data.deviceName,
          accounts: data.accounts || [],
          currentAccountId: data.currentAccountId,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastActivity: data.lastActivity?.toDate() || new Date()
        };
      } else {
        // Create new device session
        this.currentSession = {
          deviceId: this.deviceId,
          deviceName: this.getDeviceName(),
          accounts: [],
          createdAt: new Date(),
          lastActivity: new Date()
        };
        await this.saveDeviceSession();
      }
    } catch (error) {
      console.error('Error loading device session:', error);
      this.currentSession = {
        deviceId: this.deviceId,
        deviceName: this.getDeviceName(),
        accounts: [],
        createdAt: new Date(),
        lastActivity: new Date()
      };
    }
  }

  private async saveDeviceSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      await setDoc(doc(db, 'device_sessions', this.deviceId), {
        ...this.currentSession,
        lastActivity: new Date()
      });
    } catch (error) {
      console.error('Error saving device session:', error);
    }
  }

  // Add account to device
  async addAccount(firebaseUser: FirebaseUser, userProfile: User): Promise<AccountProfile> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const accountProfile: AccountProfile = {
      id: `${firebaseUser.uid}_${this.deviceId}`,
      userId: firebaseUser.uid,
      email: firebaseUser.email!,
      name: userProfile.name,
      role: userProfile.role,
      profilePicture: firebaseUser.photoURL || undefined,
      lastLogin: new Date(),
      isActive: true,
      deviceId: this.deviceId,
      sessionId
    };

    // Add to current session
    if (!this.currentSession) {
      await this.loadDeviceSession();
    }

    // Remove existing account for this user if present
    this.currentSession!.accounts = this.currentSession!.accounts.filter(
      acc => acc.userId !== firebaseUser.uid
    );

    // Add new account
    this.currentSession!.accounts.push(accountProfile);
    this.currentSession!.currentAccountId = accountProfile.id;
    this.currentSession!.lastActivity = new Date();

    await this.saveDeviceSession();
    return accountProfile;
  }

  // Switch to different account
  async switchAccount(accountId: string): Promise<AccountProfile | null> {
    if (!this.currentSession) return null;

    const account = this.currentSession.accounts.find(acc => acc.id === accountId);
    if (!account) return null;

    // Update current account
    this.currentSession.currentAccountId = accountId;
    this.currentSession.lastActivity = new Date();

    await this.saveDeviceSession();
    return account;
  }

  // Remove account from device
  async removeAccount(accountId: string): Promise<void> {
    if (!this.currentSession) return;

    const accountIndex = this.currentSession.accounts.findIndex(acc => acc.id === accountId);
    if (accountIndex === -1) return;

    // Remove account
    this.currentSession.accounts.splice(accountIndex, 1);

    // If removing current account, switch to another or clear
    if (this.currentSession.currentAccountId === accountId) {
      if (this.currentSession.accounts.length > 0) {
        this.currentSession.currentAccountId = this.currentSession.accounts[0].id;
      } else {
        this.currentSession.currentAccountId = undefined;
      }
    }

    this.currentSession.lastActivity = new Date();
    await this.saveDeviceSession();
  }

  // Get current account
  getCurrentAccount(): AccountProfile | null {
    if (!this.currentSession || !this.currentSession.currentAccountId) return null;
    
    return this.currentSession.accounts.find(
      acc => acc.id === this.currentSession!.currentAccountId
    ) || null;
  }

  // Get all accounts on device
  getDeviceAccounts(): AccountProfile[] {
    return this.currentSession?.accounts || [];
  }

  // Check if account exists on device
  hasAccount(userId: string): boolean {
    return this.currentSession?.accounts.some(acc => acc.userId === userId) || false;
  }

  // Update account profile
  async updateAccountProfile(accountId: string, updates: Partial<AccountProfile>): Promise<void> {
    if (!this.currentSession) return;

    const accountIndex = this.currentSession.accounts.findIndex(acc => acc.id === accountId);
    if (accountIndex === -1) return;

    this.currentSession.accounts[accountIndex] = {
      ...this.currentSession.accounts[accountIndex],
      ...updates,
      lastLogin: new Date()
    };

    this.currentSession.lastActivity = new Date();
    await this.saveDeviceSession();
  }

  // Clear all accounts (logout all)
  async clearAllAccounts(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.accounts = [];
    this.currentSession.currentAccountId = undefined;
    this.currentSession.lastActivity = new Date();

    await this.saveDeviceSession();
  }

  // Get device info
  getDeviceInfo(): { deviceId: string; deviceName: string; accountCount: number } {
    return {
      deviceId: this.deviceId,
      deviceName: this.currentSession?.deviceName || this.getDeviceName(),
      accountCount: this.currentSession?.accounts.length || 0
    };
  }
}

// Export singleton
export const multiAccountManager = MultiAccountManager.getInstance();
