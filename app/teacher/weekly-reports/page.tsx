'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, CheckCircle, Send, Calendar, Clock, AlertCircle, FileText, Paperclip, File, X, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import TeacherLayout from '../components/TeacherLayout';
import { WeeklyReportPrimaryPost, WeeklyReportSubPost } from '@/types';

interface UserData {
  id: string;
  username: string;
  role: 'teacher' | 'principal';
  isActive: boolean;
}

const WeeklyReportSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-gray-200 h-64 rounded-xl shadow-sm border border-gray-200"></div>
        <div className="bg-gray-200 h-48 rounded-xl shadow-sm border border-gray-200"></div>
      </div>
      <div className="w-full lg:w-2/3">
        <div className="bg-gray-200 h-96 rounded-xl shadow-sm border border-gray-200 mb-6"></div>
      </div>
    </div>
  );
};

export default function TeacherWeeklyReportsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  
  // Primary posts state
  const [primaryPosts, setPrimaryPosts] = useState<WeeklyReportPrimaryPost[]>([]);
  const [selectedPrimaryPost, setSelectedPrimaryPost] = useState<WeeklyReportPrimaryPost | null>(null);
  
  // Sub-posts state
  const [subPosts, setSubPosts] = useState<WeeklyReportSubPost[]>([]);
  const [mySubPost, setMySubPost] = useState<WeeklyReportSubPost | null>(null);
  
  // Submit form state
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate deadline (next Friday at 5 PM)
  const getNextDeadline = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    nextFriday.setHours(17, 0, 0, 0);
    return nextFriday;
  };

  const nextDeadline = getNextDeadline();
  const daysLeft = Math.ceil((nextDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // Detect user role from session
  useEffect(() => {
    const detectUser = async () => {
      try {
        const teacherSession = localStorage.getItem('teacherSession');
        
        let sessionData = null;
        let userId = null;

        if (teacherSession) {
          const parsed = JSON.parse(teacherSession);
          sessionData = parsed.teacher || parsed;
          userId = sessionData?.uid || sessionData?.id || sessionData?.userId;
        }

        if (!userId) {
          router.push('/portal/login');
          return;
        }

        setCurrentUser({
          id: userId,
          username: sessionData?.name || sessionData?.username || 'User',
          role: sessionData?.role || 'teacher',
          isActive: true
        });
      } catch (error) {
        console.error('Error detecting user:', error);
        router.push('/portal/login');
      } finally {
        setIsLoading(false);
      }
    };

    detectUser();
  }, [router]);

  // Fetch primary posts
  useEffect(() => {
    if (!currentUser) return;

    const fetchPrimaryPosts = async () => {
      try {
        const response = await fetch('/api/weekly-reports/primary-posts?isActive=true');
        if (response.ok) {
          const data = await response.json();
          console.log('Teacher fetched primary posts:', data);
          setPrimaryPosts(data);
          if (data.length > 0) {
            setSelectedPrimaryPost(data[0]);
          } else {
            setIsDataReady(true);
          }
        } else {
          console.error('Teacher failed to fetch primary posts:', response.status);
          setIsDataReady(true);
        }
      } catch (error) {
        console.error('Error fetching primary posts:', error);
        setIsDataReady(true);
      }
    };

    fetchPrimaryPosts();
  }, [currentUser]);

  // Fetch sub-posts when primary post is selected
  useEffect(() => {
    if (!selectedPrimaryPost || !currentUser) return;

    const fetchSubPosts = async () => {
      try {
        const response = await fetch(`/api/weekly-reports/sub-posts?primaryPostId=${selectedPrimaryPost.id}&teacherId=${currentUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setSubPosts(data);
          if (data.length > 0) {
            setMySubPost(data[0]);
          } else {
            setMySubPost(null);
          }
        }
      } catch (error) {
        console.error('Error fetching sub-posts:', error);
      } finally {
        setIsDataReady(true);
      }
    };

    fetchSubPosts();
  }, [selectedPrimaryPost, currentUser]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (indexToRemove: number) => {
    setAttachedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const uploadFiles = async (): Promise<{ name: string; url: string }[]> => {
    if (attachedFiles.length === 0) return [];

    setIsUploading(true);
    const uploadedFiles: { name: string; url: string }[] = [];

    try {
      for (const file of attachedFiles) {
        const storageRef = ref(storage, `weekly-reports/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedFiles.push({ name: file.name, url });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }

    return uploadedFiles;
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPrimaryPost || !reportContent.trim()) return;

    setIsSubmitting(true);
    try {
      const uploadedAttachments = await uploadFiles();
      
      const isEditing = !!mySubPost && isEditingReport;
      const finalAttachments = isEditing && uploadedAttachments.length === 0 
        ? mySubPost.attachments 
        : uploadedAttachments;

      const method = isEditing ? 'PATCH' : 'POST';
      const bodyData = isEditing ? {
        id: mySubPost.id,
        content: reportContent.trim(),
        attachments: finalAttachments
      } : {
        primaryPostId: selectedPrimaryPost.id,
        teacherId: currentUser.id,
        teacherName: currentUser.username,
        content: reportContent.trim(),
        attachments: uploadedAttachments
      };

      const response = await fetch('/api/weekly-reports/sub-posts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        setReportContent('');
        setAttachedFiles([]);
        setShowSubmitForm(false);
        setIsEditingReport(false);
        
        // Refresh sub-posts
        const fetchResponse = await fetch(`/api/weekly-reports/sub-posts?primaryPostId=${selectedPrimaryPost.id}&teacherId=${currentUser.id}`);
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setSubPosts(data);
          if (data.length > 0) {
            setMySubPost(data[0]);
          }
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!mySubPost) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this report?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/weekly-reports/sub-posts?id=${mySubPost.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMySubPost(null);
        setReportContent('');
        setAttachedFiles([]);
        setShowSubmitForm(false);
        
        // Refresh sub-posts
        const fetchResponse = await fetch(`/api/weekly-reports/sub-posts?primaryPostId=${selectedPrimaryPost?.id}&teacherId=${currentUser?.id}`);
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setSubPosts(data);
        }
      } else {
        alert('Failed to delete report.');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report. Please check console for details.');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || !isDataReady) {
    return (
      <TeacherLayout title="Weekly Reports" subtitle="Loading data...">
        <WeeklyReportSkeleton />
      </TeacherLayout>
    );
  }

  if (!currentUser) {
    return (
      <TeacherLayout title="Weekly Reports" subtitle="Please log in to view reports">
        <div className="text-center py-12">
          <p className="text-gray-600">Please log in to access weekly reports.</p>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout 
      title="Weekly Reports" 
      subtitle="View assignments and submit your weekly progress reports"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Actions & Info */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Deadline Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-3">
              <Calendar size={18} className="text-green-600" />
              Report Deadline
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-base">
                <span className="text-gray-600">Next due date:</span>
                <span className="font-medium text-gray-800">
                  {nextDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg text-base ${daysLeft <= 2 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {daysLeft <= 2 ? <AlertCircle size={20} /> : <Clock size={20} />}
                <span className="font-medium">
                  {daysLeft} days remaining
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                Please submit your weekly report every Friday before 5:00 PM. The Principal reads these on Mondays.
              </p>
            </div>
          </div>

          {/* Assignment Info Card */}
          {selectedPrimaryPost && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 border-b pb-3">
                Current Assignment
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-800">{selectedPrimaryPost.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedPrimaryPost.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>Due: {formatDate(selectedPrimaryPost.dueDate)}</span>
                </div>
                {mySubPost ? (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle size={16} />
                      <span className="font-medium">Report Submitted</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Submitted on: {formatDateTime(mySubPost.submittedAt)}
                    </p>
                    {mySubPost.acknowledged && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Acknowledged by Principal
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSubmitForm(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
                  >
                    <Send size={16} />
                    Submit Report
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit Form */}
          {showSubmitForm && selectedPrimaryPost && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider border-b pb-3">
                  {isEditingReport ? 'Edit Your Report' : 'Submit Your Report'}
                </h2>
                <button
                  onClick={() => {
                    setShowSubmitForm(false);
                    setIsEditingReport(false);
                    setReportContent('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label htmlFor="report-text" className="sr-only">Report text</label>
                  <textarea
                    id="report-text"
                    className="w-full border border-gray-300 rounded-lg p-3 text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none bg-white"
                    rows={5}
                    placeholder="Type your weekly update here. What did you teach? What do you need help with?"
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    maxLength={500}
                    required
                  ></textarea>
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${reportContent.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                      {reportContent.length}/500 characters
                    </span>
                  </div>
                </div>

                {/* Attached Files List */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="font-medium text-gray-600 text-sm">Attached Files:</p>
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2 rounded-lg">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <File size={16} className="text-blue-500 shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded text-sm flex items-center gap-1 transition-colors"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X size={16} /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-1">
                  <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 text-sm"
                  >
                    <Paperclip size={18} />
                    Attach a File
                  </button>

                  <button 
                    type="submit"
                    disabled={!reportContent.trim() || isSubmitting || isUploading || reportContent.length > 500}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 text-base shadow-sm mt-2"
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {isUploading ? 'Uploading...' : isEditingReport ? 'Updating...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        {isEditingReport ? 'Update Report' : 'Submit Weekly Report'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Assignments & My Reports */}
        <div className="w-full lg:w-2/3">
          
          {/* Active Assignments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Assignments</h2>
            {primaryPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No active assignments at this time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {primaryPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPrimaryPost(post)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPrimaryPost?.id === post.id
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{post.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{post.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            Due: {formatDate(post.dueDate)}
                          </span>
                        </div>
                      </div>
                      <CheckCircle 
                        size={20} 
                        className={selectedPrimaryPost?.id === post.id ? 'text-green-600' : 'text-gray-400'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Submitted Report */}
          {mySubPost && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-green-600" />
                My Submitted Report
              </h2>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{mySubPost.teacherName}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(mySubPost.submittedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!mySubPost.acknowledged && (
                      <div className="flex items-center gap-2 mr-2">
                        <button
                          onClick={() => {
                            setReportContent(mySubPost.content);
                            setIsEditingReport(true);
                            setShowSubmitForm(true);
                          }}
                          className="text-green-600 hover:text-green-800 bg-white p-1.5 rounded border border-green-200"
                          title="Edit Report"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={handleDeleteReport}
                          className="text-red-600 hover:text-red-800 bg-white p-1.5 rounded border border-red-200"
                          title="Delete Report"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    {mySubPost.acknowledged ? (
                      <span className="flex items-center text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                        <CheckCircle size={12} className="mr-1" />
                        Acknowledged by Principal
                      </span>
                    ) : (
                      <span className="flex items-center text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">
                        <Clock size={12} className="mr-1" />
                        Pending Review
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{mySubPost.content}</p>
                {mySubPost.attachments && mySubPost.attachments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-600 mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {mySubPost.attachments.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                        >
                          {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}