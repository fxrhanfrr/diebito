'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { authService, AuthError, AuthErrorType, UserSession } from '@/lib/auth';
import { User } from '@/lib/types';

interface UserProfile extends User {
  emailVerified: boolean;
  lastLogin?: Date;
  activeSessions?: UserSession[];
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  session: UserSession | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  getUserSessions: () => Promise<UserSession[]>;
  endUserSession: (sessionId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useEnhancedAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

export const EnhancedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Enhanced error handling
  const handleError = useCallback((error: any) => {
    if (error instanceof AuthError) {
      setError(error.message);
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
    console.error('Auth error:', error);
  }, []);

  // Load user profile from Firestore
  const loadUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    try {
      const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: data.name || '',
          role: data.role || 'patient',
          age: data.age,
          weight: data.weight,
          diabetesType: data.diabetesType,
          degreeUrl: data.degreeUrl,
          degreeVerified: data.degreeVerified,
          restaurantId: data.restaurantId,
          createdAt: data.createdAt,
          emailVerified: firebaseUser.emailVerified,
          lastLogin: data.lastLogin?.toDate(),
          activeSessions: data.activeSessions || []
        };
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
    return null;
  }, []);

  // Update activity on user interaction
  const updateActivity = useCallback(async () => {
    if (session?.sessionId) {
      try {
        await authService.getUserSessions(user?.uid || '');
      } catch (error) {
        console.error('Error updating activity:', error);
      }
    }
  }, [session, user]);

  // Set up activity tracking
  useEffect(() => {
    if (!session) return;

    const updateActivityInterval = setInterval(updateActivity, 5 * 60 * 1000); // Every 5 minutes

    // Track user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const throttledUpdate = throttle(updateActivity, 30000); // Throttle to once per 30 seconds

    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, true);
    });

    return () => {
      clearInterval(updateActivityInterval);
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdate, true);
      });
    };
  }, [session, updateActivity]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Load user profile
          const userProfile = await loadUserProfile(firebaseUser);
          setProfile(userProfile);

          // Create new session if user just signed in
          if (!session) {
            try {
              const newSession = await authService.getUserSessions(firebaseUser.uid);
              if (newSession.length > 0) {
                setSession(newSession[0]); // Use first active session
              }
            } catch (error) {
              console.error('Error creating session:', error);
            }
          }
        } else {
          setUser(null);
          setProfile(null);
          setSession(null);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadUserProfile, handleError, session]);

  // Listen for multi-account switches and reload Firestore profile accordingly
  useEffect(() => {
    const handler = async (e: any) => {
      const detail = e?.detail;
      // If the switched account belongs to a different Firebase userId, reload auth state
      // Otherwise, just reload profile from Firestore
      try {
        if (detail?.userId && auth.currentUser?.uid !== detail.userId) {
          // Soft reload to trigger onAuthStateChanged and pull the new user's profile
          // This avoids full page refresh but ensures providers re-evaluate
          const updatedProfileDoc = await getDoc(doc(db, 'users', detail.userId));
          if (updatedProfileDoc.exists()) {
            const data = updatedProfileDoc.data();
            setProfile({
              id: detail.userId,
              email: data.email,
              name: data.name || '',
              role: data.role || 'patient',
              age: data.age,
              weight: data.weight,
              diabetesType: data.diabetesType,
              degreeUrl: data.degreeUrl,
              degreeVerified: data.degreeVerified,
              restaurantId: data.restaurantId,
              createdAt: data.createdAt,
              emailVerified: !!auth.currentUser?.emailVerified,
              lastLogin: data.lastLogin?.toDate(),
              activeSessions: data.activeSessions || []
            } as any);
          }
        } else if (auth.currentUser) {
          const updatedProfile = await loadUserProfile(auth.currentUser);
          setProfile(updatedProfile);
        }
      } catch (error) {
        console.error('Error refreshing profile after account switch:', error);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('multiaccount:switch', handler as EventListener);
      window.addEventListener('multiaccount:update', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('multiaccount:switch', handler as EventListener);
        window.removeEventListener('multiaccount:update', handler as EventListener);
      }
    };
  }, [loadUserProfile]);

  // Auth methods
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { user: firebaseUser, session: newSession } = await authService.signInWithEmail(email, password);
      setUser(firebaseUser);
      setSession(newSession);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const signUpWithEmail = useCallback(async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      const { user: firebaseUser, session: newSession } = await authService.signUpWithEmail(email, password, userData);
      setUser(firebaseUser);
      setSession(newSession);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { user: firebaseUser, session: newSession } = await authService.signInWithGoogle();
      setUser(firebaseUser);
      setSession(newSession);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.signOut(session?.sessionId);
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [session, handleError]);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(email);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    setError(null);

    try {
      await authService.updateUserProfile(updates);
      
      // Reload profile to get updated data
      if (user) {
        const updatedProfile = await loadUserProfile(user);
        setProfile(updatedProfile);
      }
    } catch (error) {
      handleError(error);
    }
  }, [user, loadUserProfile, handleError]);

  const getUserSessions = useCallback(async (): Promise<UserSession[]> => {
    if (!user) return [];
    
    try {
      return await authService.getUserSessions(user.uid);
    } catch (error) {
      handleError(error);
      return [];
    }
  }, [user, handleError]);

  const endUserSession = useCallback(async (sessionId: string) => {
    try {
      await authService.endUserSession(sessionId);
      
      // If ending current session, sign out
      if (session?.sessionId === sessionId) {
        await signOut();
      }
    } catch (error) {
      handleError(error);
    }
  }, [session, signOut, handleError]);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    session,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserProfile,
    clearError,
    getUserSessions,
    endUserSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return ((...args: any[]) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
}
