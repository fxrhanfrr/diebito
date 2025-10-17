import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUser, createUser, updateUser } from '../lib/firestore';
import { User } from '../lib/types';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Try to get user data from Firestore
          const userData = await getUser(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            // User doesn't exist in Firestore yet
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for multi-account switches to override displayed profile
  useEffect(() => {
    const handler = async (e: any) => {
      const userId = e?.detail?.userId;
      if (!userId) return;
      try {
        const switchedUser = await getUser(userId);
        if (switchedUser) {
          setUser(switchedUser);
        }
      } catch (error) {
        console.error('Error loading switched account user:', error);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('multiaccount:switch', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('multiaccount:switch', handler as EventListener);
      }
    };
  }, []);

  const createUserProfile = async (userData: Partial<Omit<User, 'id' | 'createdAt'>>) => {
    if (!firebaseUser) throw new Error('No authenticated user');
    
    try {
      const userId = await createUser({
        ...userData,
        email: firebaseUser.email!,
      } as Omit<User, 'id' | 'createdAt'>);
      
      const newUser = await getUser(userId);
      if (newUser) {
        setUser(newUser);
      }
      
      return userId;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user profile');
    
    try {
      await updateUser(user.id, updates);
      const updatedUser = await getUser(user.id);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    firebaseUser,
    loading,
    createUserProfile,
    updateUserProfile,
    signOut,
    isAuthenticated: !!firebaseUser,
    hasProfile: !!user,
  };
};
