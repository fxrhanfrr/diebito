import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';
import { User } from './types';

// Session management
interface UserSession {
  userId: string;
  sessionId: string;
  deviceInfo: string;
  loginTime: Date;
  lastActivity: Date;
  isActive: boolean;
}

// Enhanced auth error types
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'auth/invalid-credential',
  EMAIL_ALREADY_EXISTS = 'auth/email-already-in-use',
  WEAK_PASSWORD = 'auth/weak-password',
  USER_NOT_FOUND = 'auth/user-not-found',
  TOO_MANY_ATTEMPTS = 'auth/too-many-requests',
  NETWORK_ERROR = 'auth/network-request-failed',
  UNKNOWN = 'unknown'
}

export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Rate limiting for auth attempts
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  isAllowed(identifier: string): boolean {
    const now = new Date();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if window has passed
    if (now.getTime() - attempt.lastAttempt.getTime() > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if under limit
    if (attempt.count < this.maxAttempts) {
      attempt.count++;
      attempt.lastAttempt = now;
      return true;
    }

    return false;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

const rateLimiter = new RateLimiter();

// Session management
export class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, UserSession[]> = new Map();

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getDeviceInfo(): string {
    if (typeof window === 'undefined') return 'server';
    
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    
    return `${platform}-${language}-${userAgent.slice(0, 50)}`;
  }

  async createSession(userId: string): Promise<UserSession> {
    const sessionId = this.generateSessionId();
    const deviceInfo = this.getDeviceInfo();
    const now = new Date();

    const session: UserSession = {
      userId,
      sessionId,
      deviceInfo,
      loginTime: now,
      lastActivity: now,
      isActive: true
    };

    // Store session in Firestore
    await setDoc(doc(db, 'user_sessions', sessionId), {
      ...session,
      loginTime: serverTimestamp(),
      lastActivity: serverTimestamp()
    });

    // Update local cache
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, []);
    }
    this.sessions.get(userId)!.push(session);

    return session;
  }

  async updateActivity(sessionId: string): Promise<void> {
    await updateDoc(doc(db, 'user_sessions', sessionId), {
      lastActivity: serverTimestamp()
    });
  }

  async endSession(sessionId: string): Promise<void> {
    await updateDoc(doc(db, 'user_sessions', sessionId), {
      isActive: false,
      endedAt: serverTimestamp()
    });
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    const userSessions = this.sessions.get(userId) || [];
    return userSessions.filter(session => session.isActive);
  }
}

// Enhanced authentication service
export class AuthService {
  private static instance: AuthService;
  private sessionManager: SessionManager;

  private constructor() {
    this.sessionManager = SessionManager.getInstance();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Enhanced sign in with rate limiting and error handling
  async signInWithEmail(email: string, password: string): Promise<{ user: FirebaseUser; session: UserSession }> {
    const identifier = `email:${email}`;
    
    if (!rateLimiter.isAllowed(identifier)) {
      throw new AuthError(
        AuthErrorType.TOO_MANY_ATTEMPTS,
        'Too many login attempts. Please try again in 15 minutes.'
      );
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Reset rate limiter on successful login
      rateLimiter.reset(identifier);

      // Create session
      const session = await this.sessionManager.createSession(user.uid);

      return { user, session };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Enhanced sign up with validation
  async signUpWithEmail(
    email: string, 
    password: string, 
    userData: Partial<User>
  ): Promise<{ user: FirebaseUser; session: UserSession }> {
    const identifier = `signup:${email}`;
    
    if (!rateLimiter.isAllowed(identifier)) {
      throw new AuthError(
        AuthErrorType.TOO_MANY_ATTEMPTS,
        'Too many signup attempts. Please try again in 15 minutes.'
      );
    }

    try {
      // Validate password strength
      if (password.length < 8) {
        throw new AuthError(
          AuthErrorType.WEAK_PASSWORD,
          'Password must be at least 8 characters long.'
        );
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: userData.name || '',
        role: userData.role || 'patient',
        createdAt: serverTimestamp(),
        emailVerified: false,
        ...userData
      });

      // Reset rate limiter on successful signup
      rateLimiter.reset(identifier);

      // Create session
      const session = await this.sessionManager.createSession(user.uid);

      return { user, session };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Enhanced Google sign in
  async signInWithGoogle(): Promise<{ user: FirebaseUser; session: UserSession }> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: user.displayName || '',
          role: 'patient',
          profilePicture: user.photoURL,
          createdAt: serverTimestamp(),
          emailVerified: user.emailVerified
        });
      }

      // Create session
      const session = await this.sessionManager.createSession(user.uid);

      return { user, session };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Enhanced sign out with session cleanup
  async signOut(sessionId?: string): Promise<void> {
    try {
      if (sessionId) {
        await this.sessionManager.endSession(sessionId);
      }
      
      await signOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Password reset
  async resetPassword(email: string): Promise<void> {
    const identifier = `reset:${email}`;
    
    if (!rateLimiter.isAllowed(identifier)) {
      throw new AuthError(
        AuthErrorType.TOO_MANY_ATTEMPTS,
        'Too many password reset attempts. Please try again in 15 minutes.'
      );
    }

    try {
      await sendPasswordResetEmail(auth, email);
      rateLimiter.reset(identifier);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Update user profile
  async updateUserProfile(updates: Partial<User>): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new AuthError(AuthErrorType.USER_NOT_FOUND, 'No authenticated user');
    }

    try {
      // Update Firebase Auth profile if name is being updated
      if (updates.name) {
        await updateProfile(user, { displayName: updates.name });
      }

      // Update Firestore profile
      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Get user sessions
  async getUserSessions(userId: string): Promise<UserSession[]> {
    return this.sessionManager.getUserSessions(userId);
  }

  // End specific session
  async endUserSession(sessionId: string): Promise<void> {
    await this.sessionManager.endSession(sessionId);
  }

  // Error handling
  private handleAuthError(error: any): AuthError {
    const errorCode = error.code || '';
    const errorMessage = error.message || 'An unknown error occurred';

    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password', error);
      
      case 'auth/email-already-in-use':
        return new AuthError(AuthErrorType.EMAIL_ALREADY_EXISTS, 'Email is already registered', error);
      
      case 'auth/weak-password':
        return new AuthError(AuthErrorType.WEAK_PASSWORD, 'Password is too weak', error);
      
      case 'auth/too-many-requests':
        return new AuthError(AuthErrorType.TOO_MANY_ATTEMPTS, 'Too many attempts. Please try again later', error);
      
      case 'auth/network-request-failed':
        return new AuthError(AuthErrorType.NETWORK_ERROR, 'Network error. Please check your connection', error);
      
      default:
        return new AuthError(AuthErrorType.UNKNOWN, errorMessage, error);
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
