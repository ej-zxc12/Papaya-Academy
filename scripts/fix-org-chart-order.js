/**
 * Script to update the order of academic staff in the organizational chart
 * Desired order: Kinder, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Registrar
 *
 * Usage: node scripts/fix-org-chart-order.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const admin = require('firebase-admin');
const { readFileSync } = require('fs');
const { join } = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  let serviceAccount = null;
  
  // Try to load from service-account-key.json file
  try {
    const serviceAccountPath = join(process.cwd(), 'service-account-key.json');
    console.log('[firebase-admin] Attempting to load from:', serviceAccountPath);
    const fileContent = readFileSync(serviceAccountPath, 'utf-8');
    serviceAccount = JSON.parse(fileContent);
    console.log('[firebase-admin] Loaded service account from file, project_id:', serviceAccount?.project_id);
  } catch (err) {
    console.error('[firebase-admin] Error loading service-account-key.json:', err?.message || err);
  }
  
  // If env vars are available, use them
  if (!serviceAccount && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID || 'papayaacademy-system',
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    console.log('[firebase-admin] Using env var credentials');
  }
  
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.projectId || 'papayaacademy-system'
    });
    console.log('[firebase-admin] Initialized with service account');
  } else {
    console.error('[firebase-admin] No credentials found');
    process.exit(1);
  }
}

const db = admin.firestore();

// Define the desired order mapping based on role/position
const orderMapping = {
  'Kinder Adviser': 1,
  'Grade 1 Adviser': 2,
  'Grade 2 Adviser': 3,
  'Grade 3 Adviser': 4,
  'Grade 4 Adviser': 5,
  'Grade 5 Adviser': 6,
  'Grade 6 Adviser': 7,
  'Registrar': 8,
  'Science / Registrar': 8,
};

async function fixOrgChartOrder() {
  console.log('🔧 Starting organizational chart order fix...');
  
  try {
    // Fetch all org chart members
    const orgChartSnapshot = await db.collection('orgChartMembers').get();
    
    console.log(`📊 Found ${orgChartSnapshot.docs.length} org chart members`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const memberDoc of orgChartSnapshot.docs) {
      const memberData = memberDoc.data();
      const memberId = memberDoc.id;
      
      // Get the role/position
      const role = memberData.role || memberData.position || '';
      
      // Check if this role has a defined order
      if (orderMapping[role]) {
        const newOrder = orderMapping[role];
        const currentOrder = memberData.order || 0;
        
        // Skip if already has the correct order
        if (currentOrder === newOrder) {
          console.log(`⏭️  Skipping ${memberData.name} (${role}) - already has correct order: ${newOrder}`);
          skippedCount++;
          continue;
        }
        
        // Update the order
        try {
          await db.collection('orgChartMembers').doc(memberId).update({
            order: newOrder
          });
          
          console.log(`✅ Updated ${memberData.name} (${role}): ${currentOrder} → ${newOrder}`);
          updatedCount++;
        } catch (error) {
          console.error(`❌ Error updating ${memberData.name}:`, error);
          errorCount++;
        }
      } else {
        console.log(`⏭️  Skipping ${memberData.name} (${role}) - no order mapping defined`);
        skippedCount++;
      }
    }
    
    console.log('\n📋 Summary:');
    console.log(`✅ Updated: ${updatedCount} members`);
    console.log(`⏭️  Skipped: ${skippedCount} members`);
    console.log(`❌ Errors: ${errorCount} members`);
    console.log('\n✨ Fix complete!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the fix
fixOrgChartOrder()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
