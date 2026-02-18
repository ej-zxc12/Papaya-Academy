import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut, User } from 'firebase/auth';

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

export async function signInTeacher(credentials: TeacherCredentials): Promise<{ user: User; teacher: Teacher }> {
  try {
    console.log('Attempting sign in for:', credentials.email);
    
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    const user = userCredential.user;
    
    console.log('Firebase auth successful for user:', user.uid);

    // For demo purposes, we'll use mock teacher data
    // In production, you would fetch this from Firestore
    const mockTeachers: Teacher[] = [
      {
        id: 'teacher1',
        name: 'Juan Dela Cruz',
        email: 'juan.delacruz@papaya.edu',
        employeeId: 'EMP001',
        department: 'Mathematics',
        subjects: ['Algebra', 'Geometry'],
        gradeLevel: 'Grade 7',
        isActive: true
      },
      {
        id: 'teacher2',
        name: 'Maria Santos',
        email: 'maria.santos@papaya.edu',
        employeeId: 'EMP002',
        department: 'Science',
        subjects: ['Biology', 'Chemistry'],
        gradeLevel: 'Grade 8',
        isActive: true
      },
      {
        id: 'test-teacher',
        name: 'Test Teacher',
        email: 'test@papaya.edu',
        employeeId: 'TEST001',
        department: 'Computer Science',
        subjects: ['Web Development', 'Database Management'],
        gradeLevel: 'Grade 10',
        isActive: true
      }
    ];

    const teacher = mockTeachers.find(t => t.email === credentials.email);
    if (!teacher) {
      console.log('Teacher not found for email:', credentials.email);
      throw new Error('Teacher not found');
    }

    console.log('Teacher profile found:', teacher.name);
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
