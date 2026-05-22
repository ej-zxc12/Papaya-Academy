const fs = require('fs');
const teacherPath = 'c:\\Users\\salv2\\OneDrive\\Desktop\\Papaya-Academy\\app\\teacher\\contributions\\page.tsx';
const principalPath = 'c:\\Users\\salv2\\OneDrive\\Desktop\\Papaya-Academy\\app\\principal\\contributions\\page.tsx';

// Update teacher page
let teacherContent = fs.readFileSync(teacherPath, 'utf-8');
teacherContent = teacherContent.replace(
  '  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;\n\n  if (isLoading) {',
  '  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;\n\n  // Calculate total rollover balance from previous year\n  const totalRolloverBalance = quotas.reduce((sum, q) => sum + (q.previousBalance || 0), 0);\n\n  if (isLoading) {'
);
teacherContent = teacherContent.replace(
  '          </div>\n\n          {/* Recent Payments Table: FIXED LAYOUT */}',
  '          </div>\n\n          {/* Rollover Balance Warning */}\n          {totalRolloverBalance > 0 && (\n            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">\n              <div>\n                <p className="text-sm font-semibold text-red-800">\n                  ⚠️ Remaining Balance from Last Year: ₱{totalRolloverBalance.toLocaleString()}\n                </p>\n                <p className="text-xs text-red-600 mt-1">\n                  This amount has been carried over from the previous year and is included in the current year\'s quota.\n                </p>\n              </div>\n            </div>\n          )}\n\n          {/* Recent Payments Table: FIXED LAYOUT */}'
);
fs.writeFileSync(teacherPath, teacherContent, 'utf-8');

// Update principal page
let principalContent = fs.readFileSync(principalPath, 'utf-8');
principalContent = principalContent.replace(
  '  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;\n\n  if (isLoading) {',
  '  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;\n\n  // Calculate total rollover balance from previous year\n  const totalRolloverBalance = quotas.reduce((sum, q) => sum + (q.previousBalance || 0), 0);\n\n  if (isLoading) {'
);
principalContent = principalContent.replace(
  '          </div>\n\n          {/* Recent Payments Table: FIXED LAYOUT */}',
  '          </div>\n\n          {/* Rollover Balance Warning */}\n          {totalRolloverBalance > 0 && (\n            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">\n              <div>\n                <p className="text-sm font-semibold text-red-800">\n                  ⚠️ Remaining Balance from Last Year: ₱{totalRolloverBalance.toLocaleString()}\n                </p>\n                <p className="text-xs text-red-600 mt-1">\n                  This amount has been carried over from the previous year and is included in the current year\'s quota.\n                </p>\n              </div>\n            </div>\n          )}\n\n          {/* Recent Payments Table: FIXED LAYOUT */}'
);
fs.writeFileSync(principalPath, principalContent, 'utf-8');

console.log('Successfully added rollover balance calculation and warning banners to both pages');
