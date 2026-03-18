'use client';

import React from 'react';
import ReportCard from './ReportCard';
import { ReportCardGrade, ReportCardSubject } from '@/types';

interface ReportCardAdapterProps {
  reportCardData: ReportCardGrade;
  studentInfo: {
    name: string;
    age: string;
    sex: 'M' | 'F';
    lrn: string;
  };
  schoolInfo: {
    name: string;
    division: string;
    region: string;
  };
  printRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ReportCardAdapter({
  reportCardData,
  studentInfo,
  schoolInfo,
  printRef
}: ReportCardAdapterProps) {
  // Convert ReportCardSubject array to the format expected by ReportCard component
  const convertSubjectsForReportCard = (subjects: ReportCardSubject[]) => {
    return subjects.map(subject => ({
      learningArea: subject.subjectName,
      quarters: [
        subject.firstGrading || null,
        subject.secondGrading || null,
        subject.thirdGrading || null,
        subject.fourthGrading || null
      ] as [number | null, number | null, number | null, number | null],
      finalGrade: subject.finalRating || undefined,
      remarks: subject.remarks || ''
    }));
  };

  const subjectsForReportCard = convertSubjectsForReportCard(reportCardData.subjects);

  return (
    <ReportCard
      studentName={studentInfo.name}
      age={studentInfo.age}
      sex={studentInfo.sex}
      grade={reportCardData.gradeLevel}
      section={reportCardData.section}
      lrn={studentInfo.lrn}
      schoolYear={reportCardData.schoolYear}
      subjects={subjectsForReportCard}
      schoolName={schoolInfo.name}
      division={schoolInfo.division}
      region={schoolInfo.region}
      principalName="" // Can be populated from school data
      adviserName={reportCardData.adviserName || ""}
      printRef={printRef}
    />
  );
}
