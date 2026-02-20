export interface NewsArticle {
  id: string | number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  tags: string[];
  featured?: boolean;
}

export interface Donation {
  id: string;
  amount: number;
  currency: string;
  donorName: string;
  donorEmail: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

export interface Student {
  id: string;
  name: string;
  gradeLevel: string;
  teacherId: string;
}

export interface AttendanceRecord {
  date: string;
  present: boolean;
  notes?: string;
}

export interface GradeRecord {
  subject: string;
  grade: number;
  semester: string;
  schoolYear: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  availability: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'fundraising' | 'community' | 'educational' | 'volunteer';
  maxAttendees?: number;
  currentAttendees: number;
  image?: string;
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

export interface TeacherCredentials {
  email: string;
  password: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  gradeLevels: string[];
  gradeLevel?: string;
  teacherId: string;
  schoolYear: string;
}

export interface SF10Record {
  id: string;
  studentId: string;
  lrn: string;
  studentName: string;
  gradeLevel: string;
  section: string;
  schoolYear: string;
  semester: string;
  subjects: SF10Subject[];
  generalAverage: number;
  status: 'promoted' | 'retained' | 'dropped';
  adviserName: string;
  dateCompleted: string;
}

export interface SF10Subject {
  subjectCode: string;
  subjectName: string;
  firstGrading: number;
  secondGrading: number;
  thirdGrading: number;
  fourthGrading: number;
  finalRating: number;
  remarks: string;
}

export interface GradeInput {
  studentId: string;
  subjectId: string;
  gradingPeriod: 'first' | 'second' | 'third' | 'fourth';
  grade: number;
  remarks?: string;
  teacherId: string;
  dateInput: string;
}

export interface Principal {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  position: string;
  isActive: boolean;
}

export interface PrincipalCredentials {
  email: string;
  password: string;
}

export interface WeeklyReport {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherDepartment: string;
  weekStartDate: string;
  weekEndDate: string;
  title: string;
  content: string;
  attachments: string[];
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  principalComments?: PrincipalComment[];
  lastModified?: string;
}

export interface PrincipalComment {
  id: string;
  principalId: string;
  principalName: string;
  comment: string;
  type: 'comment' | 'remark' | 'approval';
  createdAt: string;
}

export interface MonthlyContribution {
  id: string;
  studentId: string;
  studentName: string;
  gradeLevel: string;
  amount: number;
  month: string;
  year: string;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank' | 'online' | 'other';
  receiptNumber?: string;
  recordedBy: string;
  recordedByName: string;
  status: 'paid' | 'pending' | 'overdue';
  notes?: string;
}

export interface ContributionQuota {
  studentId: string;
  studentName: string;
  gradeLevel: string;
  monthlyAmount: number;
  yearlyQuota: number;
  totalPaid: number;
  remainingBalance: number;
  paymentStatus: 'fully_paid' | 'partially_paid' | 'not_paid';
  monthsPaid: string[];
  monthsUnpaid: string[];
  lastUpdated: string;
}

export interface ContributionSummary {
  year: string;
  totalStudents: number;
  totalExpected: number;
  totalCollected: number;
  totalRemaining: number;
  collectionRate: number;
  monthlyBreakdown: {
    month: string;
    expected: number;
    collected: number;
    rate: number;
  }[];
  gradeBreakdown: {
    gradeLevel: string;
    totalStudents: number;
    totalExpected: number;
    totalCollected: number;
    collectionRate: number;
  }[];
}
