import { NextRequest, NextResponse } from 'next/server';
import { db, storage } from '../../../lib/firebase-admin'

// Cache for 30 seconds - reduced since client now uses real-time listeners
export const revalidate = 30

export interface OrgChartMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  category: 'principal' | 'gradeAdviser' | 'academicTeacher' | 'nonAcademicStaff' | 'boardOfTrustees';
  boardName?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrgChartData {
  principal: OrgChartMember | null;
  academicStaff: OrgChartMember[];
  gradeAdvisers: OrgChartMember[];
  nonAcademicStaff: OrgChartMember[];
  boardOfTrustees: {
    [boardName: string]: OrgChartMember[];
  };
}

// Firebase Storage bucket name
const STORAGE_BUCKET = 'papayaacademy-system.firebasestorage.app';

// Helper function to resolve image URL from Firebase Storage
async function resolveImageUrl(imagePathOrUrl: string | undefined): Promise<string> {
  if (!imagePathOrUrl) return '';
  
  // If it's a local Next.js public asset, return as-is
  if (imagePathOrUrl.startsWith('/')) {
    return imagePathOrUrl;
  }
  
  // If it's already a full URL (http/https), return as-is
  if (imagePathOrUrl.startsWith('http://') || imagePathOrUrl.startsWith('https://')) {
    return imagePathOrUrl;
  }
  
  // If it's a storage path, generate proper Firebase Storage URL
  // Encode the path for URL safety
  const encodedPath = encodeURIComponent(imagePathOrUrl);
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
}

function deriveCategory(memberData: any): OrgChartMember['category'] {
  if (memberData?.category) return memberData.category;

  const department = String(memberData?.department || '').toLowerCase();
  const position = String(memberData?.position || '').toLowerCase();

  if (department === 'school organization' && position === 'principal') return 'principal';
  if (department === 'non-academic staff') return 'nonAcademicStaff';
  if (department.includes('board')) return 'boardOfTrustees';

  // Default anything else under academic staff bucket
  if (department.includes('academic') || department.includes('grade') || department.includes('adviser')) {
    // If the role/position indicates adviser, keep as gradeAdviser; otherwise academicTeacher
    if (position.includes('adviser')) return 'gradeAdviser';
    return 'academicTeacher';
  }

  // Fallback
  return 'gradeAdviser';
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching organizational chart data from Firebase...');

    const snapshot = await db.collection('orgChartMembers').get()

    if (snapshot.empty) {
      console.log('No organizational chart data found');
      return NextResponse.json({ error: 'Organizational chart data not found' }, { status: 404 });
    }

    const data: OrgChartData = {
      principal: null,
      academicStaff: [],
      gradeAdvisers: [],
      nonAcademicStaff: [],
      boardOfTrustees: {}
    };

    // Process each member and resolve image URLs
    const memberPromises = snapshot.docs.map(async (doc) => {
      const memberData = doc.data();
      
      // Resolve image URL (handles both storage paths and full URLs)
      const rawImage = (memberData.imageUrl || memberData.image || memberData.imagePath || '') as string;
      const imageUrl = await resolveImageUrl(rawImage);
      
      console.log(`Member ${memberData.name}: raw image = "${rawImage}", resolved URL = "${imageUrl}"`);

      const memberOrder = ((): number => {
        const orderVal = memberData.order;
        if (typeof orderVal === 'number' && Number.isFinite(orderVal)) return orderVal;

        const positionOrderVal = memberData.positionOrder;
        if (typeof positionOrderVal === 'number' && Number.isFinite(positionOrderVal)) return positionOrderVal;

        return 0;
      })();
      const memberCategory = deriveCategory(memberData);
      const memberRole = (memberData.role || memberData.position || '') as string;
      
      const member: OrgChartMember = {
        id: doc.id,
        name: memberData.name || '',
        role: memberRole,
        image: imageUrl,
        category: memberCategory,
        boardName: memberData.boardName || '',
        order: memberOrder,
        createdAt: memberData.createdAt?.toDate?.() ? memberData.createdAt.toDate().toISOString() : memberData.createdAt,
        updatedAt: memberData.updatedAt?.toDate?.() ? memberData.updatedAt.toDate().toISOString() : memberData.updatedAt,
      };

      return member;
    });

    const members = await Promise.all(memberPromises);

    // Categorize members
    members.forEach((member) => {
      switch (member.category) {
        case 'principal':
          if (!data.principal) {
            data.principal = member;
            break;
          }
          // If multiple principals exist, pick the one with the lowest order/position
          if ((member.order ?? 0) < (data.principal.order ?? 0)) {
            data.principal = member;
          }
          break;
        case 'gradeAdviser':
          data.academicStaff.push(member);
          data.gradeAdvisers.push(member);
          break;
        case 'academicTeacher':
          data.academicStaff.push(member);
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

    // Ensure stable ordering within each section so the UI grid matches the DB-defined order
    data.academicStaff.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    data.gradeAdvisers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    data.nonAcademicStaff.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    Object.keys(data.boardOfTrustees).forEach((board) => {
      data.boardOfTrustees[board].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
      academicStaff: [
        { id: 'ga-7', name: 'Katrina A. Ocampo', role: 'Kinder Adviser', image: '/images/kat.jpg', category: 'gradeAdviser', order: 1 },
        { id: 'ga-6', name: 'Jeanebi C. Borres', role: 'Grade 1 Adviser', image: '/images/jeanebi.jpg', category: 'gradeAdviser', order: 2 },
        { id: 'ga-5', name: 'Leizl R. Mercado', role: 'Grade 2 Adviser', image: '/images/liezl.jpg', category: 'gradeAdviser', order: 3 },
        { id: 'ga-4', name: 'Marvin Christopher Agabin', role: 'Grade 3 Adviser', image: '/images/marvin.jpg', category: 'gradeAdviser', order: 4 },
        { id: 'ga-3', name: 'Erwin Q. Molabola', role: 'Grade 4 Adviser', image: '/images/erwin.jpg', category: 'gradeAdviser', order: 5 },
        { id: 'ga-2', name: 'Daina Marie R. Lumbao', role: 'Grade 5 Adviser', image: '/images/dina.jpg', category: 'gradeAdviser', order: 6 },
        { id: 'ga-1', name: 'Geenie G. Ramos', role: 'Grade 6 Adviser', image: '/images/geen.jpg', category: 'gradeAdviser', order: 7 },
        { id: 'ga-8', name: 'Marie Sean B. Lira', role: 'Science / Registrar', image: '/images/sean.jpg', category: 'gradeAdviser', order: 8 },
      ],
      gradeAdvisers: [
        { id: 'ga-7', name: 'Katrina A. Ocampo', role: 'Kinder Adviser', image: '/images/kat.jpg', category: 'gradeAdviser', order: 1 },
        { id: 'ga-6', name: 'Jeanebi C. Borres', role: 'Grade 1 Adviser', image: '/images/jeanebi.jpg', category: 'gradeAdviser', order: 2 },
        { id: 'ga-5', name: 'Leizl R. Mercado', role: 'Grade 2 Adviser', image: '/images/liezl.jpg', category: 'gradeAdviser', order: 3 },
        { id: 'ga-4', name: 'Marvin Christopher Agabin', role: 'Grade 3 Adviser', image: '/images/marvin.jpg', category: 'gradeAdviser', order: 4 },
        { id: 'ga-3', name: 'Erwin Q. Molabola', role: 'Grade 4 Adviser', image: '/images/erwin.jpg', category: 'gradeAdviser', order: 5 },
        { id: 'ga-2', name: 'Daina Marie R. Lumbao', role: 'Grade 5 Adviser', image: '/images/dina.jpg', category: 'gradeAdviser', order: 6 },
        { id: 'ga-1', name: 'Geenie G. Ramos', role: 'Grade 6 Adviser', image: '/images/geen.jpg', category: 'gradeAdviser', order: 7 },
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

// POST endpoint to create org chart member with image upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const category = formData.get('category') as 'principal' | 'gradeAdviser' | 'nonAcademicStaff' | 'boardOfTrustees';
    const boardName = formData.get('boardName') as string;
    const order = parseInt(formData.get('order') as string) || 0;
    const imageFile = formData.get('image') as File | null;

    if (!name || !role || !category) {
      return NextResponse.json({ error: 'Name, role, and category are required' }, { status: 400 });
    }

    let imagePath = '';
    let imageUrl = '';

    // Upload image to Firebase Storage if provided
    if (imageFile) {
      const timestamp = Date.now();
      const filename = `org-chart-${timestamp}-${imageFile.name}`;
      const imageRef = storage.bucket().file(`org-chart/${filename}`);
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      await imageRef.save(buffer, {
        metadata: {
          contentType: imageFile.type,
        },
      });
      
      imagePath = `org-chart/${filename}`;
      const encodedPath = encodeURIComponent(imagePath);
      imageUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
    }

    // Create member data
    const memberData = {
      name,
      role,
      category,
      boardName: boardName || '',
      order,
      image: imagePath, // Store the path, API will resolve to URL on GET
      imageUrl, // Also store the full URL for convenience
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('orgChartMembers').add(memberData);
    
    return NextResponse.json({
      id: docRef.id,
      ...memberData,
      image: imageUrl || imagePath, // Return the full URL
    });
  } catch (error: any) {
    console.error('Error creating org chart member:', error);
    return NextResponse.json(
      { error: `Failed to create org chart member: ${error.message}` },
      { status: 500 }
    );
  }
}
