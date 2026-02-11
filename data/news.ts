import { NewsArticle } from '@/types';

export const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: "Enrollment for 2024-2025 School Year Now Open",
    excerpt: "Papaya Academy is now accepting applications for the upcoming school year. Limited slots available for deserving students.",
    content: `
      Papaya Academy is excited to announce that enrollment for the 2024-2025 school year is now officially open! 
      
      We are accepting applications for students from Kindergarten to Grade 6. Our comprehensive educational program includes:
      - Quality academic instruction
      - Free transportation services
      - Nutritional support
      - Extracurricular activities
      
      Requirements for enrollment:
      - Birth certificate
      - Report cards (for transferees)
      - Parent's ID
      - Proof of residence
      
      Enrollment period runs from June 1 to June 30, 2024. Visit our school office Monday to Friday, 8:00 AM to 4:00 PM.
      
      For more information, please call us at (02) 1234-5678 or email us at info@papayaacademy.org.
    `,
    author: "Admin Team",
    date: "2024-05-15",
    category: "Announcement",
    image: "/images/enrollment-2024.jpg",
    tags: ["enrollment", "school-year", "admission"],
    featured: true
  },
  {
    id: 2,
    title: "Family Day 2024: A Celebration of Community",
    excerpt: "Join us for our annual Family Day celebration filled with fun activities, performances, and community bonding.",
    content: `
      Mark your calendars! Papaya Academy's Family Day 2024 is happening on July 20, 2024, at our school grounds in Rodriguez, Rizal.
      
      This year's theme is "Building Stronger Families, Building Brighter Futures." The event will feature:
      - Student performances and presentations
      - Family games and activities
      - Food fair featuring local vendors
      - Raffle prizes and surprises
      - Parent-teacher conferences
      
      Schedule:
      8:00 AM - Registration and Breakfast
      9:00 AM - Opening Program
      10:00 AM - Student Performances
      11:00 AM - Family Games
      12:00 PM - Lunch Break
      1:00 PM - Awards and Recognition
      2:00 PM - Raffle Draw
      3:00 PM - Closing Program
      
      This is a wonderful opportunity to strengthen our community bonds and celebrate our students' achievements. All families are encouraged to attend!
    `,
    author: "Events Committee",
    date: "2024-06-01",
    category: "Events",
    image: "/images/family-day-2024.jpg",
    tags: ["family-day", "community", "celebration"],
    featured: true
  },
  {
    id: 3,
    title: "Student Achievements: Academic Excellence Awards",
    excerpt: "Celebrating our students' outstanding academic performance and dedication to learning this past semester.",
    content: `
      We are incredibly proud to announce the recipients of our Academic Excellence Awards for the first semester of 2024!
      
      These students have demonstrated exceptional dedication to their studies and have shown remarkable improvement in their academic performance.
      
      Honor Roll Students:
      - Maria Santos - Grade 6
      - Juan Reyes - Grade 5  
      - Ana Cruz - Grade 4
      - Miguel Garcia - Grade 3
      - Sofia Martinez - Grade 2
      - Daniel Rodriguez - Grade 1
      
      Most Improved Awards:
      - Carlos Tan - Grade 6
      - Emily Chen - Grade 5
      
      Perfect Attendance:
      - 15 students maintained perfect attendance this semester
      
      These achievements are a testament to our students' hard work and the dedication of our teaching staff. Congratulations to all our awardees!
    `,
    author: "Academic Affairs",
    date: "2024-04-20",
    category: "Achievements",
    image: "/images/academic-awards.jpg",
    tags: ["academic", "awards", "students", "achievement"],
    featured: false
  },
  {
    id: 4,
    title: "New Computer Lab Opens for Students",
    excerpt: "Our new computer lab is now fully equipped and ready to help students develop essential digital literacy skills.",
    content: `
      We are thrilled to announce the opening of our new computer laboratory, made possible through the generous support of our donors and partners.
      
      The lab features:
      - 20 brand new computers with high-speed internet
      - Educational software for all grade levels
      - Interactive learning tools
      - Printing and scanning facilities
      
      This facility will help our students:
      - Develop computer literacy skills
      - Access online educational resources
      - Prepare for the digital future
      - Enhance their learning experience
      
      Computer classes will be integrated into the regular curriculum, with each grade having dedicated computer time each week. The lab will also be available for after-school programs and special projects.
      
      We extend our heartfelt gratitude to all the donors who made this possible, especially TechCorp Philippines for their generous donation of equipment and software.
    `,
    author: "Admin Team",
    date: "2024-03-15",
    category: "Facilities",
    image: "/images/computer-lab.jpg",
    tags: ["technology", "facilities", "education", "donors"],
    featured: false
  },
  {
    id: 5,
    title: "Volunteer Recognition Day 2024",
    excerpt: "Honoring the dedicated volunteers who make our mission possible through their selfless service and commitment.",
    content: `
      On March 10, 2024, Papaya Academy celebrated Volunteer Recognition Day to honor the incredible individuals who generously give their time and skills to support our mission.
      
      This year, we recognized 45 volunteers who collectively contributed over 2,000 hours of service in 2023. These volunteers serve in various capacities:
      
      Teaching Assistants:
      - Help in classroom activities
      - Provide one-on-one tutoring
      - Assist with lesson preparation
      
      Administrative Support:
      - Help with office tasks
      - Organize student records
      - Assist in communication with parents
      
      Event Support:
      - Help organize school events
      - Assist in fundraising activities
      - Provide logistical support
      
      Special recognition was given to:
      - Ms. Anna Lopez - Volunteer of the Year (500+ hours)
      - Mr. Robert Chen - Most Dedicated Tutor
      - Ms. Sarah Santos - Best Event Coordinator
      
      Our volunteers are the backbone of our organization, and we are deeply grateful for their unwavering commitment to our students' success.
    `,
    author: "Volunteer Coordinator",
    date: "2024-03-12",
    category: "Community",
    image: "/images/volunteer-day.jpg",
    tags: ["volunteers", "recognition", "community", "appreciation"],
    featured: false
  }
];

export const getNewsById = (id: string | number): NewsArticle | undefined => {
  return newsArticles.find(article => article.id === Number(id) || article.id === id);
};

export const getFeaturedNews = (): NewsArticle[] => {
  return newsArticles.filter(article => article.featured);
};

export const getNewsByCategory = (category: string): NewsArticle[] => {
  return newsArticles.filter(article => article.category === category);
};
