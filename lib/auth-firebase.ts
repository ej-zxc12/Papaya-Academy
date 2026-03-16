import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Principal, PrincipalCredentials } from '@/types';

export interface TeacherCredentials {
  email: string;
  password: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  subjects: string[];
  gradeLevel: string;
  isActive: boolean;
}

export async function signInPrincipal(credentials: PrincipalCredentials): Promise<{ user: User; principal: Principal }> {
  try {
    console.log('Attempting principal sign in for:', credentials.email);

    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    const user = userCredential.user;

    const profileRef = doc(db, 'teachers_user', user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      await signOut(auth);
      throw new Error('Principal profile not found');
    }

    const data = profileSnap.data() as any;
    const role = typeof data.role === 'string' ? data.role : null;
    if (role !== 'principal') {
      await signOut(auth);
      throw new Error('Account is not registered as a principal');
    }

    const principal: Principal = {
      id: user.uid,
      name: data.name ?? data.username ?? user.displayName ?? credentials.email,
      email: data.email ?? user.email ?? credentials.email,
      employeeId: data.employeeId ?? '',
      position: data.position ?? 'Principal',
      isActive: data.isActive ?? true,
    };

    console.log('Principal profile loaded for:', principal.email);
    return { user, principal };
  } catch (error) {
    console.error('Firebase principal auth error:', error);
    throw error;
  }
}

export async function signInTeacher(credentials: TeacherCredentials): Promise<{ user: User; teacher: Teacher }> {
  try {
    console.log('Attempting sign in for:', credentials.email);
    
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    const user = userCredential.user;
    
    console.log('Firebase auth successful for user:', user.uid);

    // Load teacher profile from Firestore
    // Expected document path: teachers_user/{uid}
    const teacherRef = doc(db, 'teachers_user', user.uid);
    const teacherSnap = await getDoc(teacherRef);

    if (!teacherSnap.exists()) {
      throw new Error('Teacher profile not found');
    }

    const data = teacherSnap.data() as any;
    const role = typeof data.role === 'string' ? data.role : null;
    if (role && role !== 'teacher') {
      await signOut(auth);
      throw new Error('Account is not registered as a teacher');
    }
    const teacher: Teacher = {
      id: user.uid,
      name: data.name ?? data.username ?? user.displayName ?? credentials.email,
      email: data.email ?? user.email ?? credentials.email,
      employeeId: data.employeeId ?? '',
      department: data.department ?? '',
      subjects: Array.isArray(data.subjects) ? data.subjects : [],
      gradeLevel: data.gradeLevel ?? '',
      isActive: data.isActive ?? true,
    };

    console.log('Teacher profile loaded for:', teacher.email);
    return { user, teacher };
  } catch (error) {
    console.error('Firebase auth error:', error);
    throw error; // Re-throw the original error for better debugging
  }
}

export async function signOutTeacher(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Sign out failed');
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
