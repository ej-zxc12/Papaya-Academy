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
  grade: string;
  enrolledDate: string;
  sponsorId?: string;
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
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
