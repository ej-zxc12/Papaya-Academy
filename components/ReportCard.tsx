'use client';

import React from 'react';

interface ReportCardProps {
  // Student Information
  studentName: string;
  age: string;
  sex: 'M' | 'F';
  grade: string;
  section: string;
  lrn: string;
  schoolYear: string;
  trackStrand?: string;
  
  // Grade Data - Array of subjects with quarterly grades
  subjects: {
    learningArea: string;
    quarters: [number | null, number | null, number | null, number | null];
    finalGrade?: number;
    remarks?: string;
  }[];
  
  // School Information
  schoolName: string;
  division: string;
  region: string;
  
  // Signatories
  principalName: string;
  adviserName: string;
  
  // Ref for printing
  printRef?: React.RefObject<HTMLDivElement | null>;
}

const gradingScale = [
  { descriptor: 'Outstanding', range: '90 - 100', remarks: 'Passed' },
  { descriptor: 'Very Satisfactory', range: '85 - 89', remarks: 'Passed' },
  { descriptor: 'Satisfactory', range: '80 - 84', remarks: 'Passed' },
  { descriptor: 'Fairly Satisfactory', range: '75 - 79', remarks: 'Passed' },
  { descriptor: 'Did Not Meet Expectations', range: 'Below 75', remarks: 'Failed' },
];

const officialLearningAreas = [
  'Filipino',
  'English',
  'Mathematics',
  'Science',
  'GMRC (Good Manners and Right Conduct)',
  'Araling Panlipunan',
  'EPP',
  'MAPEH',
  'Music & Arts',
  'Physical Education & Health',
];

export default function ReportCard({
  studentName,
  age,
  sex,
  grade,
  section,
  lrn,
  schoolYear,
  trackStrand,
  subjects,
  schoolName,
  division,
  region,
  principalName,
  adviserName,
  printRef,
}: ReportCardProps) {
  // Calculate general average
  const calculateGeneralAverage = () => {
    const validFinalGrades = subjects
      .map(s => s.finalGrade)
      .filter((g): g is number => g !== undefined && g !== null && !isNaN(g));
    
    if (validFinalGrades.length === 0) return null;
    return Math.round((validFinalGrades.reduce((a, b) => a + b, 0) / validFinalGrades.length) * 100) / 100;
  };

  const generalAverage = calculateGeneralAverage();

  const orderedSubjects = officialLearningAreas.map((area) => {
    const found = subjects.find((s) => s.learningArea.toLowerCase().trim() === area.toLowerCase().trim());
    return (
      found || {
        learningArea: area,
        quarters: [null, null, null, null] as [number | null, number | null, number | null, number | null],
        finalGrade: undefined,
        remarks: '',
      }
    );
  });

  const getRemarks = (grade: number | null | undefined) => {
    if (grade === null || grade === undefined || isNaN(grade)) return '';
    if (grade >= 90) return 'Passed';
    if (grade >= 85) return 'Passed';
    if (grade >= 80) return 'Passed';
    if (grade >= 75) return 'Passed';
    return 'Failed';
  };

  return (
    <div
      ref={printRef}
      className="report-card bg-white p-4 w-[210mm] h-[297mm] mx-auto font-serif text-black relative overflow-hidden flex flex-col"
    >
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .report-card {
            box-shadow: none !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            border: none !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Outer Content (No border) */}
      <div className="relative flex-1">

        <div className="flex gap-4 relative z-10 items-start">
          {/* LEFT SIDE: Student information, letter, signatures, and transfer certificate sections. */}
          <div className="w-[20%] space-y-2.5 text-[8.5px] relative mt-2 px-6">
            {/* Header section with logos on sides and text in center */}
            <div className="mb-4">
              <div className="text-[11px] leading-none mb-2 font-bold">
                LRN: <span className="font-normal tracking-wider">{lrn}</span>
              </div>

              <div className="flex items-center justify-between mt-2 px-1">
                {/* Left Logo - DepEd */}
                <div className="w-[40px] h-[40px]">
                  <img
                    src="/images/foundation/deped-logo.png"
                    alt="DepEd Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full rounded-full border border-blue-800 bg-white flex items-center justify-center p-0.5">
                          <div class="text-center text-[7px] font-bold text-blue-800 uppercase leading-none">DepEd</div>
                        </div>
                      `;
                    }}
                  />
                </div>

                {/* Center Header Text */}
                <div className="text-center flex-1 px-2">
                  <p className="text-[10px] leading-tight text-black">Republic of the Philippines</p>
                  <p className="text-[10px] leading-tight text-black">Department of Education</p>
                  <p className="text-[10px] leading-tight text-black">{region}</p>
                  <p className="text-[10px] leading-tight text-black">{division}</p>
                  <h1 className="text-[14px] font-bold uppercase tracking-tight leading-tight mt-1">{schoolName}</h1>
                </div>

                {/* Right Logo - SDO Rizal */}
                <div className="w-[40px] h-[40px]">
                  <img
                    src="/images/foundation/rizal-division-logo.png"
                    alt="SDO Rizal Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full rounded-full border border-blue-600 bg-white flex items-center justify-center p-0.5">
                          <div class="text-center text-[7px] font-bold text-blue-600 uppercase leading-none">Rizal</div>
                        </div>
                      `;
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Watermark - centered behind the left column content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-visible mt-32 translate-x-20">
              <div className="opacity-[0.15] scale-[10.5] transform-gpu">
                <img
                  src="/images/watermark.png"
                  alt="Watermark Background"
                  className="w-[200px] h-[200px] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-60 h-60 rounded-full border-4 border-gray-400 flex items-center justify-center transform -rotate-12">
                        <div class="text-center">
                          <div class="text-xs text-gray-400 font-bold tracking-wider uppercase">Watermark</div>
                          <div class="text-lg text-green-600 font-bold my-1">Papaya Academy</div>
                        </div>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>

            {/* Student Information */}
            <div className="text-[11px] relative z-10 space-y-2 pr-1 mt-6">
              <div className="flex items-end">
                <span className="font-bold w-12 mr-1">Name:</span>
                <div className="w-64 border-b border-black px-1 uppercase font-bold text-[13px] leading-tight min-h-[1.4rem] flex items-end">
                  {studentName}
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-end">
                  <span className="font-bold w-9 mr-1">Age:</span>
                  <div className="w-12 border-b border-black px-1 min-h-[1.4rem] flex items-end justify-center text-[12px]">{age}</div>
                </div>
                <div className="flex items-end flex-1 justify-center ml-40">
                  <span className="font-bold w-10 mr-2">Sex:</span>
                  <div className="w-12 border-b border-black px-1 min-h-[1.4rem] flex items-end justify-center text-[12px]">{sex}</div>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center">
                  <span className="font-bold w-12 mr-1">Grade: </span>
                  <span className="font-bold ml-1">{grade}</span>
                </div>
                <div className="flex items-end flex-1 justify-center ml-40">
                  <span className="font-bold w-16 mr-2">Section:</span>
                  <div className="w-16 border-b border-black px-1 min-h-[1.4rem] flex items-end justify-center text-[12px]">{section}</div>
                </div>
              </div>

              <div className="flex items-center">
                <span className="font-bold w-14 mr-1">School</span>
                <span className="font-bold mr-1">Year: </span>
                <div className="w-28 border-b border-black px-1 font-bold min-h-[1.4rem] flex items-end justify-center text-[12px] tracking-widest">{schoolYear}</div>
              </div>

              <div className="flex items-center">
                <span className="font-bold w-14 mr-1">Track/</span>
                <span className="font-bold mr-1">Strand:</span>
                <div className="w-32 border-b border-black px-1 min-h-[1.4rem] flex items-end justify-center text-[12px]">{trackStrand || ''}</div>
              </div>
            </div>

            {/* Dear Parent Message */}
            <div className="leading-snug relative z-10 pr-0.5 mt-6">
              <p className="mb-2 text-[10px]"><span className="font-bold">Dear Parent:</span></p>
              <p className="text-justify mb-2 text-[10px] px-2">
                This report card shows the ability and progress your child has made in the different learning areas as well as his/her core values.
              </p>
              <p className="text-justify text-[10px] px-2">
                The school welcomes you should you desire to know more about your child&apos;s progress.
              </p>
            </div>

            {/* Signatures - Side by Side */}
            <div className="mt-8 grid grid-cols-2 gap-12 relative z-10 px-4">
              <div className="text-center">
                <div className="border-b border-black w-full mb-1 min-h-[1.5rem] flex items-end justify-center">
                  <p className="font-bold text-[11px] leading-tight">{principalName}</p>
                </div>
                <p className="text-[10px] font-bold mt-1">School Principal</p>
              </div>
              <div className="text-center">
                <div className="border-b border-black w-full mb-1 min-h-[1.5rem] flex items-end justify-center">
                  <p className="font-bold text-[11px] leading-tight">{adviserName}</p>
                </div>
                <p className="text-[10px] font-bold mt-1">Adviser</p>
              </div>
            </div>

            {/* Certificate of Transfer - NO BORDER */}
            <div className="mt-8 relative z-10 px-2">
              <p className="text-center mb-4 text-[11px] font-bold">Certificate of Transfer</p>
              <div className="space-y-3 text-[11px]">
                <div className="flex items-end">
                  <span className="font-bold whitespace-nowrap">Admitted to Grade:</span>
                  <div className="w-32 border-b border-black ml-1 min-h-[1.2rem]"></div>
                  <span className="ml-4 font-bold whitespace-nowrap">Section:</span>
                  <div className="w-32 border-b border-black ml-1 min-h-[1.2rem]"></div>
                </div>
                <div className="flex items-end">
                  <span className="font-bold whitespace-nowrap">Eligibly for Admission to Grade:</span>
                  <div className="flex-1 border-b border-black ml-1 min-h-[1.2rem]"></div>
                </div>
                <div className="grid grid-cols-2 gap-16 mt-6">
                  <div className="text-center">
                    <div className="border-b border-black w-full mb-1"></div>
                    <span className="text-[10px] font-bold">Principal</span>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-black w-full mb-1"></div>
                    <span className="text-[10px] font-bold">Teacher</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancellation section - NO BORDER */}
            <div className="mt-2 relative z-10 px-2">
              <p className="font-bold text-center mb-4 text-[11px]">Cancellation of Eligibility to Transfer</p>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-end">
                  <span className="font-bold whitespace-nowrap">Admitted in:</span>
                  <div className="w-64 border-b border-black ml-1 min-h-[1.2rem]"></div>
                </div>
                <div className="grid grid-cols-2 gap-12 items-end">

  <div className="grid grid-cols-[auto_1fr] items-end gap-4">

  <div className="flex items-end gap-20">

{/* Date and Principal lines */}
   <div className="grid grid-cols-2 gap-16 mt-6">
  {/* Date */}
  <div className="text-center">
    <div className="border-b border-black w-40 mb-1"></div>
    <span className="text-[10px] font-bold">Date</span>
  </div>

  {/* Principal (shift right) */}
  <div className="text-center relative left-64"> {/* <-- shift right by 1rem */}
    <div className="border-b border-black w-44 mb-1 min-h-[10rem] flex items-end justify-center"></div>
    <span className="text-[10px] font-bold">Principal</span>
  </div>
</div>

</div>
</div>

</div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Grading Table */}
          <div className="w-[55%] border-l border-gray-200 pl-4 pt-1">
            <div className="text-[13px] font-bold uppercase tracking-tight text-center mb-3">
              REPORT ON LEARNING PROGRESS AND ACHIEVEMENT
            </div>

            {/* Learning Areas Table */}
            <table className="w-full border-collapse text-[11px] border border-black">
              <thead>
                <tr>
                  <th className="border border-black p-2 text-center w-[45%] text-[10px] font-bold uppercase">
                    Learning Areas
                  </th>
                  <th className="border border-black p-2 text-center text-[10px] font-bold uppercase" colSpan={4}>
                    Quarter
                  </th>
                  <th className="border border-black p-2 text-center w-[12%] text-[10px] font-bold uppercase leading-tight">
                    Final
                    <br />
                    Grade
                  </th>
                  <th className="border border-black p-2 text-center w-[12%] text-[10px] font-bold uppercase">
                    Remarks
                  </th>
                </tr>
                <tr>
                  <th className="border border-black p-1"></th>
                  <th className="border border-black p-1 text-center w-[8%] font-bold text-[10px]">1</th>
                  <th className="border border-black p-1 text-center w-[8%] font-bold text-[10px]">2</th>
                  <th className="border border-black p-1 text-center w-[8%] font-bold text-[10px]">3</th>
                  <th className="border border-black p-1 text-center w-[8%] font-bold text-[10px]">4</th>
                  <th className="border border-black p-1"></th>
                  <th className="border border-black p-1"></th>
                </tr>
              </thead>
              <tbody>
                {orderedSubjects.map((subject, index) => (
                  <tr key={index} className="h-[26px]">
                    <td className="border border-black px-3 py-1 text-[11px] leading-tight font-bold text-left">
                      {subject.learningArea}
                    </td>
                    <td className="border border-black p-1 text-center font-normal text-[11px]">
                      {subject.quarters[0] !== null ? subject.quarters[0] : ''}
                    </td>
                    <td className="border border-black p-1 text-center font-normal text-[11px]">
                      {subject.quarters[1] !== null ? subject.quarters[1] : ''}
                    </td>
                    <td className="border border-black p-1 text-center font-normal text-[11px]">
                      {subject.quarters[2] !== null ? subject.quarters[2] : ''}
                    </td>
                    <td className="border border-black p-1 text-center font-normal text-[11px]">
                      {subject.quarters[3] !== null ? subject.quarters[3] : ''}
                    </td>
                    <td className="border border-black p-1 text-center font-normal text-[11px]">
                      {subject.finalGrade !== undefined ? subject.finalGrade : ''}
                    </td>
                    <td className="border border-black p-1 text-center text-[10px] font-normal">
                      {subject.remarks || getRemarks(subject.finalGrade)}
                    </td>
                  </tr>
                ))}
                {/* General Average Row */}
                <tr className="h-[28px]">
                  <td className="border border-black px-3 font-bold text-[11px] uppercase text-center" colSpan={5}>
                    General Average
                  </td>
                  <td className="border border-black p-1 text-center font-bold text-[11px]">
                    {generalAverage || ''}
                  </td>
                  <td className="border border-black p-1 text-center text-[10px] font-bold uppercase">
                    {generalAverage ? getRemarks(generalAverage) : ''}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Grading Scale - NO BORDER */}
            <div className="mt-6 p-1">
              <div className="grid grid-cols-3 gap-8 text-[10px]">
                <div>
                  <div className="font-bold mb-2">Descriptors</div>
                  {gradingScale.map((scale, idx) => (
                    <div key={idx} className="leading-tight py-1">
                      {scale.descriptor}
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <div className="font-bold mb-2">Grading Scale</div>
                  {gradingScale.map((scale, idx) => (
                    <div key={idx} className="leading-tight py-1">
                      {scale.range}
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <div className="font-bold mb-2">Remarks</div>
                  {gradingScale.map((scale, idx) => (
                    <div key={idx} className="leading-tight py-1">
                      {scale.remarks}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format student data for the report card
export function formatStudentForReportCard(
  student: {
    id: string;
    name: string;
    lrn?: string;
    gradeLevel: string;
    section?: string;
    age?: number;
    sex?: 'M' | 'F';
  },
  grades: Record<string, {
    quarters: [number | null, number | null, number | null, number | null];
    finalGrade?: number;
    remarks?: string;
  }>,
  schoolYear: string = '2025-2026'
): Omit<ReportCardProps, 'schoolName' | 'division' | 'region' | 'principalName' | 'adviserName' | 'printRef'> {
  const subjects = Object.entries(grades).map(([subject, data]) => ({
    learningArea: subject,
    quarters: data.quarters,
    finalGrade: data.finalGrade,
    remarks: data.remarks,
  }));

  return {
    studentName: student.name,
    age: student.age?.toString() || '',
    sex: student.sex || 'M',
    grade: student.gradeLevel,
    section: student.section || '',
    lrn: student.lrn || student.id,
    schoolYear,
    trackStrand: '',
    subjects,
  };
}
