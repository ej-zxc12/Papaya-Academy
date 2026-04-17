const { readFileSync } = require('fs');
const { join } = require('path');

const serviceAccountPath = join(process.cwd(), '..', 'service-account-key.json');
const content = readFileSync(serviceAccountPath, 'utf-8');
const sa = JSON.parse(content);

console.log('\n=== Add these to Vercel Environment Variables ===\n');
console.log('FIREBASE_PROJECT_ID=' + sa.project_id);
console.log('FIREBASE_CLIENT_EMAIL=' + sa.client_email);
console.log('FIREBASE_PRIVATE_KEY=' + JSON.stringify(sa.private_key));
console.log('\n=================================================\n');
