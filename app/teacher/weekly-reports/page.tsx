'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MessageCircle, CheckCircle, Send, Calendar, Clock, AlertCircle, FileText, Paperclip, File, X } from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  getDoc,
  where,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import TeacherLayout from '../components/TeacherLayout';

interface WeeklyReport {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorRole: 'teacher' | 'principal';
  acknowledged: boolean;
  attachments: { name: string; url: string }[];
  createdAt: Timestamp | null;
}

interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorRole: 'teacher' | 'principal';
  createdAt: Timestamp | null;
}

interface UserData {
  id: string;
  username: string;
  role: 'teacher' | 'principal';
  isActive: boolean;
}

export default function WeeklyReportsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [comments, setComments] = useState<{ [reportId: string]: Comment[] }>({});
  const [newPostContent, setNewPostContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [reportId: string]: string }>({});
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

  // Detect user role from session and teachers_user collection
  useEffect(() => {
    const detectUser = async () => {
      try {
        // Check for teacher session
        const teacherSession = localStorage.getItem('teacherSession');
        const principalSession = localStorage.getItem('principalSession');
        
        let sessionData = null;
        let userId = null;

        if (teacherSession) {
          const parsed = JSON.parse(teacherSession);
          sessionData = parsed.teacher || parsed;
          userId = sessionData?.uid || sessionData?.id || sessionData?.userId;
        } else if (principalSession) {
          const parsed = JSON.parse(principalSession);
          sessionData = parsed.principal || parsed;
          userId = sessionData?.uid || sessionData?.id || sessionData?.userId;
        }

        if (!userId) {
          router.push('/portal/login');
          return;
        }

        // Fetch user role from teachers_user collection
        const userDoc = await getDoc(doc(db, 'teachers_user', userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            id: userId,
            username: userData.username || sessionData?.name || 'User',
            role: userData.role || 'teacher',
            isActive: userData.isActive !== false
          });
        } else {
          // Fallback to session data
          setCurrentUser({
            id: userId,
            username: sessionData?.name || sessionData?.username || 'User',
            role: sessionData?.role || 'teacher',
            isActive: true
          });
        }
      } catch (error) {
        console.error('Error detecting user:', error);
        router.push('/portal/login');
      } finally {
        setIsLoading(false);
      }
    };

    detectUser();
  }, [router]);

  // Subscribe to reports
  useEffect(() => {
    if (!currentUser) return;

    const reportsQuery = query(
      collection(db, 'weekly_reports'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      const reportsData: WeeklyReport[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        reportsData.push({
          id: doc.id,
          text: data.text || '',
          authorId: data.authorId || '',
          authorName: data.authorName || 'Unknown',
          authorRole: data.authorRole || 'teacher',
          acknowledged: data.acknowledged || false,
          attachments: data.attachments || [],
          createdAt: data.createdAt || null
        });
      });
      setReports(reportsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Subscribe to comments for each report
  useEffect(() => {
    if (!currentUser || reports.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    reports.forEach((report) => {
      const commentsQuery = query(
        collection(db, 'weekly_reports', report.id, 'comments'),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const commentsData: Comment[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          commentsData.push({
            id: doc.id,
            text: data.text || '',
            authorId: data.authorId || '',
            authorName: data.authorName || 'Unknown',
            authorRole: data.authorRole || 'teacher',
            createdAt: data.createdAt || null
          });
        });
        setComments((prev) => ({ ...prev, [report.id]: commentsData }));
      });

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [currentUser, reports.length]);

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

  const handlePostReport = async () => {
    if (!currentUser || (!newPostContent.trim() && attachedFiles.length === 0)) return;

    setIsSubmitting(true);
    try {
      const uploadedAttachments = await uploadFiles();

      await addDoc(collection(db, 'weekly_reports'), {
        text: newPostContent.trim(),
        authorId: currentUser.id,
        authorName: currentUser.username,
        authorRole: currentUser.role,
        acknowledged: false,
        attachments: uploadedAttachments,
        createdAt: serverTimestamp()
      });

      setNewPostContent('');
      setAttachedFiles([]);
    } catch (error) {
      console.error('Error posting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAcknowledge = async (reportId: string, currentStatus: boolean) => {
    if (!currentUser || currentUser.role !== 'principal') return;

    try {
      const reportRef = doc(db, 'weekly_reports', reportId);
      await updateDoc(reportRef, {
        acknowledged: !currentStatus
      });
    } catch (error) {
      console.error('Error updating acknowledgment:', error);
    }
  };

  const handlePostComment = async (reportId: string) => {
    const commentText = commentInputs[reportId];
    if (!currentUser || !commentText || !commentText.trim()) return;

    try {
      const commentsRef = collection(db, 'weekly_reports', reportId, 'comments');
      await addDoc(commentsRef, {
        text: commentText.trim(),
        authorId: currentUser.id,
        authorName: currentUser.username,
        authorRole: currentUser.role,
        createdAt: serverTimestamp()
      });

      setCommentInputs((prev) => ({ ...prev, [reportId]: '' }));
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <TeacherLayout title="Weekly Reports" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
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
      subtitle={currentUser.role === 'principal' ? 'Review and acknowledge teacher reports' : 'Submit your weekly progress reports'}
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

          {/* Post Creation Area - Visible only to Teachers */}
          {currentUser.role === 'teacher' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 border-b pb-3">
                Write New Report
              </h2>
              <div className="flex flex-col gap-4">
                <label htmlFor="report-text" className="sr-only">Report text</label>
                <textarea
                  id="report-text"
                  className="w-full border border-gray-300 rounded-lg p-3 text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none bg-white"
                  rows={5}
                  placeholder="Type your weekly update here. What did you teach? What do you need help with?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                ></textarea>

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
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 text-sm"
                  >
                    <Paperclip size={18} />
                    Attach a File
                  </button>

                  <button 
                    onClick={handlePostReport}
                    disabled={(!newPostContent.trim() && attachedFiles.length === 0) || isSubmitting || isUploading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 text-base shadow-sm mt-2"
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {isUploading ? 'Uploading...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Weekly Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Principal Info Card - Visible only to Principals */}
          {currentUser.role === 'principal' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 border-b pb-3">
                Principal Actions
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed bg-purple-50 p-3 rounded-lg border border-purple-100">
                You can acknowledge reports by clicking the &quot;Mark as Read&quot; button on each report. Teachers will see when their reports have been acknowledged.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Reports Feed */}
        <div className="w-full lg:w-2/3">
          <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">All Submitted Reports</h2>
            <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-md border border-gray-200">
              Total Posts: {reports.length}
            </span>
          </div>

          <div className="space-y-6">
            {reports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                <FileText className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">No reports yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {currentUser.role === 'teacher' 
                    ? 'Be the first to submit a weekly report!' 
                    : 'No reports have been submitted yet.'}
                </p>
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  
                  {/* Report Header */}
                  <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-full ${report.authorRole === 'principal' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-800">{report.authorName}</p>
                        <p className="text-sm text-gray-500">{formatDate(report.createdAt)}</p>
                      </div>
                    </div>
                    {report.acknowledged && (
                      <span className="flex items-center text-sm text-green-700 font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-md">
                        <CheckCircle size={16} className="mr-1.5" /> Read by Principal
                      </span>
                    )}
                  </div>

                  {/* Report Content */}
                  <div className="p-5 text-gray-800 bg-white">
                    <p className="whitespace-pre-wrap leading-relaxed text-base">{report.text}</p>
                    
                    {/* Display Attachments in Feed */}
                    {report.attachments && report.attachments.length > 0 && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="font-medium text-gray-600 mb-2 text-sm">Attached Files:</p>
                        <div className="flex flex-wrap gap-2">
                          {report.attachments.map((file, idx) => (
                            <a 
                              key={idx} 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                            >
                              <File size={16} className="text-blue-500" />
                              <span className="text-sm font-medium">{file.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="border-t border-gray-100 px-5 py-3 flex items-center space-x-4 bg-gray-50">
                    {currentUser.role === 'principal' ? (
                      <button 
                        onClick={() => handleToggleAcknowledge(report.id, report.acknowledged)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
                          report.acknowledged 
                            ? 'text-green-700 bg-green-100 hover:bg-green-200' 
                            : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <CheckCircle size={18} />
                        <span>{report.acknowledged ? 'You Read This' : 'Mark as Read'}</span>
                      </button>
                    ) : (
                      <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${report.acknowledged ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                        <CheckCircle size={18} />
                        <span>
                          {report.acknowledged ? 'Read by Principal' : 'Waiting for Principal'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-600 text-sm font-medium">
                      <MessageCircle size={18} />
                      <span>{(comments[report.id] || []).length} Comments</span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="border-t border-gray-100 bg-gray-50 p-5">
                    {(comments[report.id] || []).length > 0 && (
                      <div className="space-y-4 mb-5">
                        {(comments[report.id] || []).map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <div className={`mt-0.5 p-2 rounded-full h-fit border ${comment.authorRole === 'principal' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-gray-500 border-gray-200'}`}>
                              <User size={16} />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-3 flex-1 shadow-sm">
                              <p className="text-sm font-semibold text-gray-800">{comment.authorName}</p>
                              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{comment.text}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatDate(comment.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-2">
                      <label htmlFor={`comment-${report.id}`} className="sr-only">Add comment</label>
                      <input
                        id={`comment-${report.id}`}
                        type="text"
                        placeholder="Type a comment here..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-white"
                        value={commentInputs[report.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [report.id]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handlePostComment(report.id)}
                      />
                      <button 
                        onClick={() => handlePostComment(report.id)}
                        disabled={!commentInputs[report.id]?.trim()}
                        className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors font-medium text-sm flex justify-center items-center gap-2"
                      >
                        <Send size={16} />
                        Post
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
          
        </div>
      </div>
    </TeacherLayout>
  );
}
