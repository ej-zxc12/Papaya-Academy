'use client';

import { useState, useEffect } from 'react';
import { ReportCardGrade, ReportCardSubject } from '@/types';

interface UseReportCardOptions {
  teacherId: string;
  schoolYear?: string;
}

export function useReportCard({ teacherId, schoolYear = '2024-2025' }: UseReportCardOptions) {
  const [reportCards, setReportCards] = useState<ReportCardGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all report cards for the teacher
  const fetchReportCards = async (gradeLevel?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = gradeLevel 
        ? `/api/teacher/report-cards?gradeLevel=${gradeLevel}&schoolYear=${schoolYear}`
        : `/api/teacher/report-cards?schoolYear=${schoolYear}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${teacherId}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report cards');
      }

      const data = await response.json();
      setReportCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific student's report card
  const fetchStudentReportCard = async (studentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/teacher/report-cards?studentId=${studentId}&schoolYear=${schoolYear}`, {
        headers: {
          'Authorization': `Bearer ${teacherId}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student report card');
      }

      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generate report card from existing grades
  const generateReportCard = async (studentId: string, gradeLevel: string, section: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/teacher/report-cards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherId}`
        },
        body: JSON.stringify({
          studentId,
          gradeLevel,
          section,
          schoolYear
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report card');
      }

      const data = await response.json();
      return data.reportCard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save or update report card
  const saveReportCard = async (reportCardData: Partial<ReportCardGrade>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/teacher/report-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherId}`
        },
        body: JSON.stringify({
          ...reportCardData,
          schoolYear
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save report card');
      }

      const data = await response.json();
      
      // Update local state
      setReportCards(prev => {
        const existingIndex = prev.findIndex(rc => rc.id === data.reportCard.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = data.reportCard;
          return updated;
        } else {
          return [...prev, data.reportCard];
        }
      });

      return data.reportCard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update specific subject in report card
  const updateSubject = async (reportCardId: string, subjectId: string, subjectData: Partial<ReportCardSubject>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/teacher/report-cards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherId}`
        },
        body: JSON.stringify({
          reportCardId,
          subjectId,
          subjectData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update subject');
      }

      const data = await response.json();
      
      // Update local state
      setReportCards(prev => 
        prev.map(rc => 
          rc.id === reportCardId ? data.reportCard : rc
        )
      );

      return data.reportCard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete report card
  const deleteReportCard = async (reportCardId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/teacher/report-cards?reportCardId=${reportCardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${teacherId}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete report card');
      }

      // Update local state
      setReportCards(prev => prev.filter(rc => rc.id !== reportCardId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    reportCards,
    loading,
    error,
    fetchReportCards,
    fetchStudentReportCard,
    generateReportCard,
    saveReportCard,
    updateSubject,
    deleteReportCard
  };
}
