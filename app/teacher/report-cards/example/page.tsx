'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportCardGrade } from '@/types';
import TeacherLayout from '../../components/TeacherLayout';
import { useReportCard } from '@/hooks/useReportCard';
import ReportCardAdapter from '@/components/ReportCardAdapter';

export default function ReportCardExample() {
  const router = useRouter();
  const [teacherData, setTeacherData] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('Grade 1');
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [showPreview, setShowPreview] = useState(false);

  const { 
    fetchStudentReportCard, 
    generateReportCard, 
    saveReportCard,
    loading 
  } = useReportCard({ 
    teacherId: teacherData?.uid || teacherData?.id || '', 
    schoolYear 
  });

  const [currentReportCard, setCurrentReportCard] = useState<ReportCardGrade | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('teacherSession');
    if (!session) {
      router.push('/teacher/login');
      return;
    }

    try {
      const parsed = JSON.parse(session);
      setTeacherData(parsed.teacher || parsed);
    } catch (error) {
      console.error('Error parsing session:', error);
      router.push('/teacher/login');
    }
  }, [router]);

  const handleGenerateReportCard = async () => {
    if (!selectedStudent || !teacherData) return;

    const reportCard = await generateReportCard(
      selectedStudent,
      selectedGradeLevel,
      'Section A' // You can make this dynamic
    );

    if (reportCard) {
      setCurrentReportCard(reportCard);
      setShowPreview(true);
    }
  };

  const handleSaveReportCard = async () => {
    if (!currentReportCard) return;

    const saved = await saveReportCard(currentReportCard);
    if (saved) {
      alert('Report card saved successfully!');
    }
  };

  // Example student data - in real app, this would come from your students API
  const exampleStudents = [
    { id: 'student1', name: 'Juan Dela Cruz', gradeLevel: 'Grade 1' },
    { id: 'student2', name: 'Maria Santos', gradeLevel: 'Grade 1' },
    { id: 'student3', name: 'Jose Reyes', gradeLevel: 'Grade 2' },
  ];

  const filteredStudents = exampleStudents.filter(s => s.gradeLevel === selectedGradeLevel);

  if (!teacherData) {
    return <div>Loading...</div>;
  }

  return (
    <TeacherLayout title="Report Card Example">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">Generate Report Card</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose a student...</option>
                {filteredStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level
              </label>
              <select
                value={selectedGradeLevel}
                onChange={(e) => setSelectedGradeLevel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Year
              </label>
              <input
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateReportCard}
            disabled={!selectedStudent || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report Card'}
          </button>
        </div>

        {showPreview && currentReportCard && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Report Card Preview</h3>
              <div className="space-x-4">
                <button
                  onClick={() => window.print()}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Print
                </button>
                <button
                  onClick={handleSaveReportCard}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-4">
              <ReportCardAdapter
                reportCardData={currentReportCard}
                studentInfo={{
                  name: filteredStudents.find(s => s.id === selectedStudent)?.name || 'Unknown',
                  age: '7', // Example age
                  sex: 'M', // Example sex
                  lrn: '123456789012' // Example LRN
                }}
                schoolInfo={{
                  name: 'Papaya Academy',
                  division: 'Division of Example',
                  region: 'Region IV-A'
                }}
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-bold text-blue-800 mb-2">How to use the Report Card System:</h4>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Select a student from the dropdown</li>
            <li>Choose the grade level and school year</li>
            <li>Click "Generate Report Card" to create a report card from existing grades</li>
            <li>The system will automatically calculate final ratings and general average</li>
            <li>Subjects will be displayed on the right side of the report card with quarterly grades</li>
            <li>You can print or save the report card for future reference</li>
          </ol>
        </div>
      </div>
    </TeacherLayout>
  );
}
