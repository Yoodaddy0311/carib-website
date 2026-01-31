/**
 * Firebase Authentication Service
 *
 * Handles anonymous authentication for Cloud Functions access.
 * GCP organization policy blocks allUsers access, so we use
 * Firebase Auth anonymous login to authenticate API requests.
 */

import { auth } from './config';
import {
  signInAnonymously,
  onAuthStateChanged,
  User,
  getIdToken,
} from 'firebase/auth';

// Cache for the current user
let currentUser: User | null = null;
let authInitialized = false;
let authPromise: Promise<User | null> | null = null;

/**
 * Initialize auth state listener
 * This should be called once when the app starts
 */
export function initAuthListener(): void {
  if (typeof window === 'undefined') return;

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    authInitialized = true;
  });
}

/**
 * Sign in anonymously to Firebase
 * Returns the anonymous user or throws an error
 */
export async function signInAnonymousUser(): Promise<User> {
  try {
    const userCredential = await signInAnonymously(auth);
    currentUser = userCredential.user;
    return userCredential.user;
  } catch (error) {
    console.error('Anonymous sign-in failed:', error);
    throw new Error('Authentication failed. Please try again.');
  }
}

/**
 * Get the current authenticated user
 * If not authenticated, signs in anonymously
 */
export async function getAuthenticatedUser(): Promise<User> {
  // If we already have a cached promise, return it
  if (authPromise) {
    const user = await authPromise;
    if (user) return user;
  }

  // If already authenticated, return current user
  if (currentUser) {
    return currentUser;
  }

  // Wait for auth to initialize if needed
  if (!authInitialized && typeof window !== 'undefined') {
    await new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        currentUser = user;
        authInitialized = true;
        unsubscribe();
        resolve();
      });
    });

    if (currentUser) {
      return currentUser;
    }
  }

  // Sign in anonymously
  authPromise = signInAnonymousUser().then((user): User | null => user);
  const user = await authPromise;
  authPromise = null;
  if (!user) {
    throw new Error('Failed to authenticate user.');
  }
  return user;
}

/**
 * Get Firebase ID token for the current user
 * If not authenticated, signs in anonymously first
 * @param forceRefresh - Force refresh the token even if not expired
 */
export async function getAuthToken(forceRefresh: boolean = false): Promise<string> {
  const user = await getAuthenticatedUser();

  try {
    const token = await getIdToken(user, forceRefresh);
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);

    // Token might be expired or invalid, try to refresh
    if (!forceRefresh) {
      return getAuthToken(true);
    }

    throw new Error('Failed to get authentication token.');
  }
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return currentUser !== null;
}

/**
 * Get current user without waiting for auth
 * May return null if auth hasn't initialized
 */
export function getCurrentUser(): User | null {
  return currentUser;
}

/**
 * Sign out the current user
 * Note: For anonymous users, this will delete the anonymous account
 */
export async function signOut(): Promise<void> {
  try {
    await auth.signOut();
    currentUser = null;
  } catch (error) {
    console.error('Sign out failed:', error);
    throw new Error('Sign out failed. Please try again.');
  }
}

// Initialize auth listener on module load (client-side only)
if (typeof window !== 'undefined') {
  initAuthListener();
}
