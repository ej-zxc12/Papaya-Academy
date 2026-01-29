import { notFound } from 'next/navigation';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  Calendar, 
  BookOpen,
  Heart,
  Award
} from 'lucide-react';
import ProgramClient from './ProgramClient'; 

// --- THE DATA DATABASE (Server Side) ---
const PROGRAM_DETAILS: Record<string, any> = {
  'early-childhood': {
    title: "Early Childhood Education",
    tagline: "Nurturing the Seeds of Hope",
    heroImage: "/images/1.jpg", 
    description: "Our Early Childhood Education program is designed to provide a safe, stimulating, and nurturing environment for children aged 3-5. We believe that the early years are critical for brain development, and our play-based curriculum fosters social, emotional, and cognitive growth.",
    stats: [
      { label: "Age Group", value: "3 - 5 Years", icon: <Users className="w-5 h-5" /> },
      { label: "Class Size", value: "15 Students", icon: <Users className="w-5 h-5" /> },
      { label: "Schedule", value: "Mon - Fri", icon: <Calendar className="w-5 h-5" /> },
      { label: "Focus", value: "Holistic Growth", icon: <Heart className="w-5 h-5" /> },
    ],
    curriculum: [
      { title: "Social-Emotional Learning", desc: "Activities that teach sharing, empathy, and self-expression." },
      { title: "Foundational Literacy", desc: "Introduction to alphabet, sounds, and storytelling." },
      { title: "Basic Numeracy", desc: "Counting, shapes, and patterns through play." },
      { title: "Creative Arts", desc: "Drawing, music, and movement to spark imagination." },
    ],
    impactText: "Since inception, 90% of our preschool graduates have successfully transitioned to regular elementary schools with above-average readiness scores."
  },
  'k-12': {
    title: "K-12 Basic Education",
    tagline: "Empowering Future Leaders",
    heroImage: "/images/3.jpg",
    description: "Our K-12 program follows the Department of Education (DepEd) curriculum but enhances it with a strong emphasis on values formation, computer literacy, and environmental awareness.",
    stats: [
      { label: "Grades", value: "1 - 12", icon: <BookOpen className="w-5 h-5" /> },
      { label: "Accreditation", value: "DepEd Recognized", icon: <Award className="w-5 h-5" /> },
      { label: "Schedule", value: "Full Day", icon: <Clock className="w-5 h-5" /> },
      { label: "Focus", value: "Academic & Values", icon: <CheckCircle2 className="w-5 h-5" /> },
    ],
    curriculum: [
      { title: "Core Academics", desc: "Rigorous training in Math, Science, English, and Filipino." },
      { title: "Values Education", desc: "Weekly classes focused on integrity, respect, and community service." },
      { title: "Digital Literacy", desc: "Hands-on computer classes starting from Grade 1." },
      { title: "Environmental Science", desc: "Practical lessons on recycling and sustainability specific to Payatas." },
    ],
    impactText: "Our high school retention rate is 95%, significantly higher than the local average."
  },
  'tvl': {
    title: "Technical-Vocational (TVL)",
    tagline: "Skills for a Brighter Tomorrow",
    heroImage: "/images/jeep.jpg",
    description: "The TVL track is designed for students who wish to gain immediate employment skills. We partner with TESDA and local industries to ensure our curriculum matches real-world job demands.",
    stats: [
      { label: "Certification", value: "NC II (TESDA)", icon: <Award className="w-5 h-5" /> },
      { label: "Duration", value: "2 Years", icon: <Calendar className="w-5 h-5" /> },
      { label: "Internship", value: "300 Hours", icon: <Clock className="w-5 h-5" /> },
      { label: "Focus", value: "Job Readiness", icon: <CheckCircle2 className="w-5 h-5" /> },
    ],
    curriculum: [
      { title: "Cookery & Baking", desc: "Commercial cooking skills and bakery management." },
      { title: "Electrical Installation", desc: "Domestic and industrial wiring and maintenance." },
      { title: "Computer Servicing", desc: "Hardware repair, networking, and troubleshooting." },
      { title: "Entrepreneurship", desc: "How to start and manage a small business." },
    ],
    impactText: "85% of our TVL graduates secure employment within 3 months of graduation."
  },
  'nutrition': {
    title: "Nutrition & Health Program",
    tagline: "Health is Wealth",
    heroImage: "/images/gallery/community1.jpg",
    description: "We believe that you cannot teach a hungry child. Our comprehensive health program addresses the physical well-being of our students through daily feeding, regular check-ups, and vitamin supplementation.",
    stats: [
      { label: "Meals Served", value: "500+ Daily", icon: <Heart className="w-5 h-5" /> },
      { label: "Checkups", value: "Quarterly", icon: <Calendar className="w-5 h-5" /> },
      { label: "Beneficiaries", value: "All Students", icon: <Users className="w-5 h-5" /> },
      { label: "Focus", value: "Zero Malnutrition", icon: <CheckCircle2 className="w-5 h-5" /> },
    ],
    curriculum: [
      { title: "Daily Lunch", desc: "Nutritious, balanced meals prepared by community parents." },
      { title: "Medical Mission", desc: "Annual dental and medical checkups with volunteer doctors." },
      { title: "Deworming", desc: "Bi-annual deworming schedule for all students." },
      { title: "Parent Education", desc: "Seminars on affordable, healthy cooking for families." },
    ],
    impactText: "Malnutrition rates among our student body have dropped by 70% since the program's launch."
  }
};

// --- STATIC PARAMS GENERATION ---
export async function generateStaticParams() {
  return [
    { slug: 'early-childhood' },
    { slug: 'k-12' },
    { slug: 'tvl' },
    { slug: 'nutrition' },
  ];
}

// --- SERVER PAGE COMPONENT ---
// UPDATED: Added 'async' keyword and wrapped 'params' type in Promise
export default async function ProgramDetail({ params }: { params: Promise<{ slug: string }> }) {
  
  // UPDATED: Await the params to get the slug
  const resolvedParams = await params;
  const content = PROGRAM_DETAILS[resolvedParams.slug];

  if (!content) {
    return notFound();
  }

  return <ProgramClient content={content} />;
}