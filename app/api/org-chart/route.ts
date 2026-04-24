import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin'

// Cache for 5 minutes (300 seconds) - public content that changes infrequently
export const revalidate = 300

export interface OrgChartMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  category: 'principal' | 'gradeAdviser' | 'nonAcademicStaff' | 'boardOfTrustees';
  boardName?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrgChartData {
  principal: OrgChartMember | null;
  gradeAdvisers: OrgChartMember[];
  nonAcademicStaff: OrgChartMember[];
  boardOfTrustees: {
    [boardName: string]: OrgChartMember[];
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching organizational chart data from Firebase...');

    const snapshot = await db.collection('orgChartMembers').orderBy('order', 'asc').get()

    if (snapshot.empty) {
      console.log('No organizational chart data found');
      return NextResponse.json({ error: 'Organizational chart data not found' }, { status: 404 });
    }

    const data: OrgChartData = {
      principal: null,
      gradeAdvisers: [],
      nonAcademicStaff: [],
      boardOfTrustees: {}
    };

    snapshot.docs.forEach((doc) => {
      const memberData = doc.data();
      const member: OrgChartMember = {
        id: doc.id,
        name: memberData.name || '',
        role: memberData.role || '',
        image: memberData.image || '',
        category: memberData.category || 'gradeAdviser',
        boardName: memberData.boardName || '',
        order: memberData.order || 0,
        createdAt: memberData.createdAt?.toDate?.() ? memberData.createdAt.toDate().toISOString() : memberData.createdAt,
        updatedAt: memberData.updatedAt?.toDate?.() ? memberData.updatedAt.toDate().toISOString() : memberData.updatedAt,
      };

      switch (member.category) {
        case 'principal':
          data.principal = member;
          break;
        case 'gradeAdviser':
          data.gradeAdvisers.push(member);
          break;
        case 'nonAcademicStaff':
          data.nonAcademicStaff.push(member);
          break;
        case 'boardOfTrustees':
          if (member.boardName) {
            if (!data.boardOfTrustees[member.boardName]) {
              data.boardOfTrustees[member.boardName] = [];
            }
            data.boardOfTrustees[member.boardName].push(member);
          }
          break;
      }
    });

    console.log('Organizational chart data fetched successfully');
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Error fetching organizational chart data:', error);

    // Return default data (hardcoded members) if Firebase is not available
    console.warn('Firebase not available - returning default organizational chart data');
    return NextResponse.json({
      principal: {
        id: 'default-principal',
        name: 'Sheryl Ann B. Queliza',
        role: 'School Principal',
        image: '/images/sheryl.jpg',
        category: 'principal',
        order: 1
      },
      gradeAdvisers: [
        { id: 'ga-1', name: 'Geenie G. Ramos', role: 'Grade 6 Adviser', image: '/images/geen.jpg', category: 'gradeAdviser', order: 1 },
        { id: 'ga-2', name: 'Daina Marie R. Lumbao', role: 'Grade 5 Adviser', image: '/images/dina.jpg', category: 'gradeAdviser', order: 2 },
        { id: 'ga-3', name: 'Erwin Q. Molabola', role: 'Grade 4 Adviser', image: '/images/erwin.jpg', category: 'gradeAdviser', order: 3 },
        { id: 'ga-4', name: 'Marvin Christopher Agabin', role: 'Grade 3 Adviser', image: '/images/marvin.jpg', category: 'gradeAdviser', order: 4 },
        { id: 'ga-5', name: 'Leizl R. Mercado', role: 'Grade 2 Adviser', image: '/images/liezl.jpg', category: 'gradeAdviser', order: 5 },
        { id: 'ga-6', name: 'Jeanebi C. Borres', role: 'Grade 1 Adviser', image: '/images/jeanebi.jpg', category: 'gradeAdviser', order: 6 },
        { id: 'ga-7', name: 'Katrina A. Ocampo', role: 'Kinder Adviser', image: '/images/kat.jpg', category: 'gradeAdviser', order: 7 },
        { id: 'ga-8', name: 'Marie Sean B. Lira', role: 'Science / Registrar', image: '/images/sean.jpg', category: 'gradeAdviser', order: 8 },
      ],
      nonAcademicStaff: [
        { id: 'nas-1', name: 'Ma. Luzviminda M. Macabuhay', role: 'Office Manager', image: '/images/luz.jpg', category: 'nonAcademicStaff', order: 1 },
        { id: 'nas-2', name: 'Salvacion M. Macasacuit', role: 'Housekeeper', image: '/images/salve.jpg', category: 'nonAcademicStaff', order: 2 },
        { id: 'nas-3', name: 'Roger C. Macasacuit', role: 'School Driver / Maintenance', image: '/images/roger.jpg', category: 'nonAcademicStaff', order: 3 },
      ],
      boardOfTrustees: {
        'Papaya Academy Inc.': [
          { id: 'bai-1', name: 'Ailyn C. Gardose', role: 'President', image: '/images/ailyn.jpg', category: 'boardOfTrustees', boardName: 'Papaya Academy Inc.', order: 1 },
          { id: 'bai-2', name: 'Hadassah A. Castro', role: 'Corporate Secretary', image: '/images/hadassah.jpg', category: 'boardOfTrustees', boardName: 'Papaya Academy Inc.', order: 2 },
          { id: 'bai-3', name: 'Michelle Ann Salmorin', role: 'Treasurer', image: '/images/michelle.jpg', category: 'boardOfTrustees', boardName: 'Papaya Academy Inc.', order: 3 },
          { id: 'bai-4', name: 'Maria Julie Collado', role: 'Member', image: '/images/maria.jpg', category: 'boardOfTrustees', boardName: 'Papaya Academy Inc.', order: 4 },
          { id: 'bai-5', name: 'Tristan Ian C. Santos', role: 'Member', image: '/images/tristan.jpg', category: 'boardOfTrustees', boardName: 'Papaya Academy Inc.', order: 5 },
        ],
        'Kalinga at Pag-ibig Foundation Board (PH)': [
          { id: 'kpf-1', name: 'John Van Dijk', role: 'President', image: '/images/john.jpg', category: 'boardOfTrustees', boardName: 'Kalinga at Pag-ibig Foundation Board (PH)', order: 1 },
          { id: 'kpf-2', name: 'Michelle Ann Salmorin', role: 'Treasurer', image: '/images/michelle.jpg', category: 'boardOfTrustees', boardName: 'Kalinga at Pag-ibig Foundation Board (PH)', order: 2 },
          { id: 'kpf-3', name: 'Ailyn C. Gardose', role: 'Corporate Secretary', image: '/images/ailyn.jpg', category: 'boardOfTrustees', boardName: 'Kalinga at Pag-ibig Foundation Board (PH)', order: 3 },
          { id: 'kpf-4', name: 'Hadassah A. Castro', role: 'Member', image: '/images/hadassah.jpg', category: 'boardOfTrustees', boardName: 'Kalinga at Pag-ibig Foundation Board (PH)', order: 4 },
          { id: 'kpf-5', name: 'Alberto Villamor', role: 'Member', image: '/images/alberto.jpg', category: 'boardOfTrustees', boardName: 'Kalinga at Pag-ibig Foundation Board (PH)', order: 5 },
          { id: 'kpf-6', name: 'Max Willem Heinen', role: 'Member', image: '/images/max.jpg', category: 'boardOfTrustees', boardName: 'Kalinga at Pag-ibig Foundation Board (PH)', order: 6 },
        ],
        'Stichting Kalingaboard (NL)': [
          { id: 'skn-1', name: 'Janneke Heinen', role: 'Chairwoman', image: '/images/janneke.jpg', category: 'boardOfTrustees', boardName: 'Stichting Kalingaboard (NL)', order: 1 },
          { id: 'skn-2', name: 'Arno Van Workum', role: 'Treasurer', image: '/images/arno.jpg', category: 'boardOfTrustees', boardName: 'Stichting Kalingaboard (NL)', order: 2 },
          { id: 'skn-3', name: 'Miranda Van Loon', role: 'Secretary', image: '/images/miranda.jpg', category: 'boardOfTrustees', boardName: 'Stichting Kalingaboard (NL)', order: 3 },
          { id: 'skn-4', name: 'Peter Van Schijndel', role: 'General Board Member', image: '/images/peter.jpg', category: 'boardOfTrustees', boardName: 'Stichting Kalingaboard (NL)', order: 4 },
          { id: 'skn-5', name: 'Heleen Scheer', role: 'General Board Member', image: '/images/helen.jpg', category: 'boardOfTrustees', boardName: 'Stichting Kalingaboard (NL)', order: 5 },
          { id: 'skn-6', name: 'Daniel Van Scherpenzeel', role: 'General Board Member', image: '/images/daniel.jpg', category: 'boardOfTrustees', boardName: 'Stichting Kalingaboard (NL)', order: 6 },
          { id: 'skn-7', name: 'Mirjam Van Bruggen', role: 'General Board Member', image: '/images/mirjam.jpg', category: 'boardOfTrustees', boardName: 'Stichting Kalingaboard (NL)', order: 7 },
          { id: 'skn-8', name: 'Alwin Tettero', role: 'General Board Member', image: '/images/alwin.jpg', category: 'boardOfTrustees', boardName: 'Stichting Kalingaboard (NL)', order: 8 },
          { id: 'skn-9', name: 'Pim Van Hattum', role: 'General Board Member', image: '/images/pim.jpg', category: 'boardOfTrustees', boardName: 'Stichting Kalingaboard (NL)', order: 9 },
          { id: 'skn-10', name: 'Felisart Joana Loren', role: 'General Board Member', image: '/images/mirjam1.jpg', category: 'boardOfTrustees', boardName: 'Stichting Kalingaboard (NL)', order: 10 },
        ],
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, must-revalidate',
      },
    });
  }
}
