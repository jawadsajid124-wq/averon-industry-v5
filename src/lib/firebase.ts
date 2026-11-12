import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  reauthenticateWithPopup,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TeamMember, TeamRole, TeamMemberStatus } from '../types/index.ts';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');


// Structured Error Handler conforming to SKILL.md
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Security Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Phone Auth & Recaptcha Helpers
let recaptchaVerifierInstance: RecaptchaVerifier | null = null;

export function getOrCreateRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifierInstance) {
    try {
      recaptchaVerifierInstance.clear();
    } catch {}
    recaptchaVerifierInstance = null;
  }
  
  recaptchaVerifierInstance = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired. Resetting verifier.');
    }
  });

  return recaptchaVerifierInstance;
}

export async function sendFirebasePhoneOtp(
  phoneNumber: string, 
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    return await signInWithPhoneNumber(auth, phoneNumber, verifier);
  } catch (err: any) {
    console.error('Firebase signInWithPhoneNumber error:', err);
    throw err;
  }
}

// Google Reauthentication for Owner 1 Identity Updates
export async function reauthenticateGoogleOwner(): Promise<{
  success: boolean;
  user: FirebaseUser;
  idToken: string;
}> {
  if (!auth.currentUser) {
    // If not currently signed into Firebase Auth, sign in with popup
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    return { success: true, user: result.user, idToken: token };
  }

  try {
    const cred = await reauthenticateWithPopup(auth.currentUser, googleProvider);
    const token = await cred.user.getIdToken();
    return { success: true, user: cred.user, idToken: token };
  } catch (err) {
    // Fallback: signInWithPopup
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    return { success: true, user: result.user, idToken: token };
  }
}

// 1. Check if super ownership has been claimed (Dual Super Owner Support)
export interface OwnershipClaimData {
  claimed: boolean;
  owner1Uid?: string;
  owner1Email?: string;
  owner1Name?: string;
  owner2Uid?: string;
  owner2Phone?: string;
  owner2Name?: string;
  ownerUid?: string;
  ownerEmail?: string;
  ownerName?: string;
  claimedAt: string;
}

export async function checkOwnershipStatus(): Promise<{
  isClaimed: boolean;
  claimData: OwnershipClaimData | null;
}> {
  try {
    const ownershipRef = doc(db, 'system', 'ownership');
    const snap = await getDoc(ownershipRef);
    if (snap.exists()) {
      const data = snap.data() as OwnershipClaimData;
      return { isClaimed: data.claimed === true, claimData: data };
    }
    return { isClaimed: false, claimData: null };
  } catch (err) {
    console.error('Failed reading system ownership state:', err);
    return { isClaimed: false, claimData: null };
  }
}

// 2. Atomic First Super Owner Claim
export async function claimSuperOwnership(user: FirebaseUser): Promise<{
  success: boolean;
  message: string;
}> {
  const ownershipRef = doc(db, 'system', 'ownership');
  const roleRef = doc(db, 'roles_super_owner', user.uid);

  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    const claimPayload: OwnershipClaimData = {
      claimed: true,
      owner1Uid: user.uid,
      owner1Email: user.email || 'jawadsajid124@gmail.com',
      owner1Name: user.displayName || 'Super Owner 1 (Gmail)',
      owner2Phone: '+92 305 6674374',
      owner2Name: 'Super Owner 2 (Phone)',
      ownerUid: user.uid,
      ownerEmail: user.email || 'unknown',
      ownerName: user.displayName || 'Super Owner',
      claimedAt: now,
    };

    batch.set(ownershipRef, claimPayload);
    batch.set(roleRef, {
      uid: user.uid,
      email: user.email || 'unknown',
      role: 'SUPER_OWNER',
      assignedAt: now,
    });

    await batch.commit();
    return { success: true, message: 'Super Owner status successfully locked and assigned.' };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, 'system/ownership');
  }
}

// 3. Verify if user has the Super Owner role
export async function checkIsSuperOwner(uid: string): Promise<boolean> {
  try {
    const roleRef = doc(db, 'roles_super_owner', uid);
    const snap = await getDoc(roleRef);
    if (snap.exists() && snap.data()?.role === 'SUPER_OWNER') return true;

    const ownershipRef = doc(db, 'system', 'ownership');
    const ownSnap = await getDoc(ownershipRef);
    if (ownSnap.exists()) {
      const d = ownSnap.data();
      if (d.owner1Uid === uid || d.owner2Uid === uid || d.ownerUid === uid) return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

// 4. Test Firestore Connection
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'ownership'));
    return true;
  } catch (error) {
    console.warn('Firestore connection check:', error);
    return false;
  }
}

// 5. Team Management (Admins & Owners)
export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const colPath = 'team_members';
  try {
    const colRef = collection(db, colPath);
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data() as TeamMember);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, colPath);
  }
}

export function onTeamMembersSnapshot(
  onUpdate: (members: TeamMember[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colPath = 'team_members';
  const colRef = collection(db, colPath);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as TeamMember);
      onUpdate(list);
    },
    (error) => {
      console.error('Team members snapshot error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  );
}

export async function inviteTeamMember(
  email: string,
  role: TeamRole,
  superOwnerEmail: string
): Promise<TeamMember> {
  const cleanEmail = email.trim().toLowerCase();
  const memberId = `member_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const docPath = `team_members/${memberId}`;

  const member: TeamMember = {
    id: memberId,
    email: cleanEmail,
    role,
    status: 'INVITED',
    invitedBy: superOwnerEmail,
    invitedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const memberRef = doc(db, 'team_members', memberId);
    await setDoc(memberRef, member);
    return member;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function updateTeamMemberRole(memberId: string, role: TeamRole): Promise<void> {
  const docPath = `team_members/${memberId}`;
  try {
    const memberRef = doc(db, 'team_members', memberId);
    await updateDoc(memberRef, {
      role,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, docPath);
  }
}

export async function updateTeamMemberStatus(memberId: string, status: TeamMemberStatus): Promise<void> {
  const docPath = `team_members/${memberId}`;
  try {
    const memberRef = doc(db, 'team_members', memberId);
    await updateDoc(memberRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, docPath);
  }
}

export async function removeTeamMember(memberId: string): Promise<void> {
  const docPath = `team_members/${memberId}`;
  try {
    const memberRef = doc(db, 'team_members', memberId);
    await deleteDoc(memberRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

