import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserSecurityLog, UserRole } from '../types';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Validates connection to Firestore on initial app boot
 * Required by Firebase integration guidelines
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: Client is offline or Firestore is initializing.');
    }
    return false;
  }
}

/**
 * Fetch or initialize the user profile in Firestore
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return null;
  }
}

/**
 * Record a security log event for the user
 */
export async function logSecurityEvent(
  userId: string,
  eventType: UserSecurityLog['eventType'],
  details: string = ''
): Promise<void> {
  try {
    const logId = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const logRef = doc(db, 'users', userId, 'securityLogs', logId);
    const logPayload: UserSecurityLog = {
      id: logId,
      userId,
      eventType,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      details,
    };
    await setDoc(logRef, logPayload);
  } catch (err) {
    console.warn('Non-blocking security log write notice:', err);
  }
}

/**
 * Create or synchronize user profile document upon login
 */
export async function syncUserProfile(
  firebaseUser: FirebaseUser,
  fallbackName?: string,
  assignedRole: UserRole = 'user'
): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(userDocRef);
  const now = new Date().toISOString();

  let profile: UserProfile;

  if (snap.exists()) {
    const existing = snap.data() as UserProfile;
    profile = {
      ...existing,
      displayName: firebaseUser.displayName || existing.displayName || fallbackName || 'Anonymous Agent',
      email: firebaseUser.email || existing.email || 'guest@aura.local',
      photoURL: firebaseUser.photoURL || existing.photoURL,
      lastLoginAt: now,
    };
    await updateDoc(userDocRef, {
      displayName: profile.displayName,
      lastLoginAt: now,
      ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL } : {}),
    });
  } else {
    profile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || (firebaseUser.isAnonymous ? 'guest@aura.local' : 'user@domain.com'),
      displayName: firebaseUser.displayName || fallbackName || (firebaseUser.isAnonymous ? 'Guest Agent' : 'AURA Member'),
      role: assignedRole,
      createdAt: now,
      lastLoginAt: now,
      photoURL: firebaseUser.photoURL || undefined,
      mfaEnabled: false,
    };
    await setDoc(userDocRef, profile);
  }

  // Record audit log
  await logSecurityEvent(
    firebaseUser.uid,
    snap.exists() ? 'sign_in' : 'sign_up',
    `Authenticated via ${firebaseUser.providerData[0]?.providerId || 'password/anonymous'}`
  );

  return profile;
}

/**
 * Fetch security logs for the user
 */
export async function fetchUserSecurityLogs(userId: string): Promise<UserSecurityLog[]> {
  try {
    const logsRef = collection(db, 'users', userId, 'securityLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(15));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as UserSecurityLog);
  } catch (err) {
    console.error('Failed to fetch security logs:', err);
    return [];
  }
}

/**
 * Update user profile details
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, updates);
  if (auth.currentUser && updates.displayName) {
    await updateProfile(auth.currentUser, { displayName: updates.displayName });
  }
  await logSecurityEvent(userId, 'profile_update', `Updated profile fields: ${Object.keys(updates).join(', ')}`);
}

/**
 * Auth actions
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return await syncUserProfile(cred.user);
}

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  role: UserRole = 'user'
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return await syncUserProfile(cred.user, displayName, role);
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const cred = await signInWithPopup(auth, googleProvider);
  return await syncUserProfile(cred.user);
}

export async function loginAsGuest(): Promise<UserProfile> {
  const cred = await signInAnonymously(auth);
  return await syncUserProfile(cred.user, 'Guest Explorer', 'guest');
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser(): Promise<void> {
  if (auth.currentUser) {
    await logSecurityEvent(auth.currentUser.uid, 'sign_out', 'User logged out securely.');
  }
  await signOut(auth);
}

export { onAuthStateChanged };
export type { FirebaseUser };
