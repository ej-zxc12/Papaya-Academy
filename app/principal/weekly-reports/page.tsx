'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, CheckCircle, Send, Calendar, Clock, AlertCircle, FileText, Plus, Users, CheckCircle2, Circle, X, Edit, Trash2, Paperclip, File as FileIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import PrincipalLayout from '../components/PrincipalLayout';
import { WeeklyReportPrimaryPost, WeeklyReportSubPost, TeacherCompletionStatus } from '@/types';

interface UserData {
  id: string;
  username: string;
  role: 'teacher' | 'principal';
  isActive: boolean;
}

const PrincipalSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="bg-gray-200 h-24 rounded-xl shadow-sm border border-gray-200"></div>
      <div className="bg-gray-200 h-48 rounded-xl shadow-sm border border-gray-200"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 h-96 rounded-xl shadow-sm border border-gray-200"></div>
        <div className="bg-gray-200 h-96 rounded-xl shadow-sm border border-gray-200"></div>
      </div>
    </div>
  );
};

export default function PrincipalWeeklyReportsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  
  const [primaryPosts, setPrimaryPosts] = useState<WeeklyReportPrimaryPost[]>([]);
  const [selectedPrimaryPost, setSelectedPrimaryPost] = useState<WeeklyReportPrimaryPost | null>(null);
  
  const [subPosts, setSubPosts] = useState<WeeklyReportSubPost[]>([]);
  
  const [completionStatus, setCompletionStatus] = useState<TeacherCompletionStatus[]>([]);
  const [completionStatusMap, setCompletionStatusMap] = useState<Record<string, TeacherCompletionStatus[]>>({});
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);
  const [isFetchingTracking, setIsFetchingTracking] = useState(false);
  const [isFetchingSubPosts, setIsFetchingSubPosts] = useState(false);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostDueDate, setNewPostDueDate] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostDescription, setEditPostDescription] = useState('');
  const [editPostDueDate, setEditPostDueDate] = useState('');

  // File upload state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const detectUser = async () => {
      try {
        const principalSession = localStorage.getItem('principalSession');
        
        let sessionData = null;
        let userId = null;

        if (principalSession) {
          const parsed = JSON.parse(principalSession);
          sessionData = parsed.principal || parsed;
          userId = sessionData?.uid || sessionData?.id || sessionData?.userId;
        }

        if (!userId) {
          router.push('/portal/login');
          return;
        }

        setCurrentUser({
          id: userId,
          username: sessionData?.name || sessionData?.username || 'User',
          role: sessionData?.role || 'principal',
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

  const getCache = (key: string) => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const CACHE_TTL = 5 * 60 * 1000;
        if (Date.now() - timestamp < CACHE_TTL) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    return null;
  };

  const setCache = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };

  const clearCache = (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const fetchPrimaryPosts = async () => {
      setIsFetchingPosts(true);
      try {
        const cachedPosts = getCache('weekly_reports_primary_posts');
        const cachedStatusMap = getCache('weekly_reports_completion_status_map');
        
        if (cachedPosts) {
          setPrimaryPosts(cachedPosts);
          if (cachedStatusMap) {
            setCompletionStatusMap(cachedStatusMap);
          }
          if (cachedPosts.length > 0) {
            setSelectedPrimaryPost(cachedPosts[0]);
          }
          setIsFetchingPosts(false);
          setIsDataReady(true);
          return;
        }

        const response = await fetch('/api/weekly-reports/primary-posts?isActive=true');
        if (response.ok) {
          const data = await response.json();
          setPrimaryPosts(data);
          setCache('weekly_reports_primary_posts', data);
          
          const statusMap: Record<string, TeacherCompletionStatus[]> = {};
          for (const post of data) {
            try {
              const statusResponse = await fetch(`/api/weekly-reports/tracking?primaryPostId=${post.id}`);
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                statusMap[post.id] = statusData;
              }
            } catch (error) {
              console.error(`Error fetching status for post ${post.id}:`, error);
            }
          }
          setCompletionStatusMap(statusMap);
          setCache('weekly_reports_completion_status_map', statusMap);
          
          if (data.length > 0) {
            setSelectedPrimaryPost(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching primary posts:', error);
      } finally {
        setIsFetchingPosts(false);
        setIsDataReady(true);
      }
    };

    fetchPrimaryPosts();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchTeachers = async () => {
      try {
        const response = await fetch('/api/weekly-reports/teachers');
        if (response.ok) {
          const data = await response.json();
          setAllTeachers(data);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };

    fetchTeachers();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedPrimaryPost) return;

    const fetchSubPosts = async () => {
      setIsFetchingSubPosts(true);
      try {
        const cacheKey = `weekly_reports_sub_posts_${selectedPrimaryPost.id}`;
        const cachedSubPosts = getCache(cacheKey);
        
        if (cachedSubPosts) {
          setSubPosts(cachedSubPosts);
          setIsFetchingSubPosts(false);
          return;
        }

        const response = await fetch(`/api/weekly-reports/sub-posts?primaryPostId=${selectedPrimaryPost.id}`);
        if (response.ok) {
          const data = await response.json();
          setSubPosts(data);
          setCache(cacheKey, data);
        }
      } catch (error) {
        console.error('Error fetching sub-posts:', error);
      } finally {
        setIsFetchingSubPosts(false);
      }
    };

    const fetchCompletionStatus = async () => {
      setIsFetchingTracking(true);
      try {
        const cacheKey = `weekly_reports_completion_status_${selectedPrimaryPost.id}`;
        const cachedStatus = getCache(cacheKey);
        
        if (cachedStatus) {
          setCompletionStatus(cachedStatus);
          setIsFetchingTracking(false);
          return;
        }

        const response = await fetch(`/api/weekly-reports/tracking?primaryPostId=${selectedPrimaryPost.id}`);
        if (response.ok) {
          const data = await response.json();
          setCompletionStatus(data);
          setCache(cacheKey, data);
        }
      } catch (error) {
        console.error('Error fetching completion status:', error);
      } finally {
        setIsFetchingTracking(false);
      }
    };

    fetchSubPosts();
    fetchCompletionStatus();
  }, [selectedPrimaryPost]);

  // File Upload Handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE_MB = 2;
    const files = Array.from(event.target.files || []);
    
    const validFiles = files.filter(file => {
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > MAX_FILE_SIZE_MB) {
        alert(`File ${file.name} exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
        return false;
      }
      return true;
    });

    setAttachedFiles((prev) => [...prev, ...validFiles]);
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
        const storageRef = ref(storage, `primary-posts/${Date.now()}_${file.name}`);
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

  const handleCreatePrimaryPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newPostTitle.trim() || !newPostDescription.trim() || !newPostDueDate) return;

    setIsCreatingPost(true);
    try {
      const uploadedAttachments = await uploadFiles();

      const response = await fetch('/api/weekly-reports/primary-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPostTitle.trim(),
          description: newPostDescription.trim(),
          dueDate: newPostDueDate,
          createdBy: currentUser.id,
          createdByName: currentUser.username,
          schoolYear: new Date().getFullYear().toString(),
          attachments: uploadedAttachments
        })
      });

      if (response.ok) {
        alert('Assignment created successfully.');
        setNewPostTitle('');
        setNewPostDescription('');
        setNewPostDueDate('');
        setAttachedFiles([]);
        setShowCreateForm(false);
        
        clearCache('weekly_reports_primary_posts');
        clearCache('weekly_reports_completion_status_map');
        
        const fetchResponse = await fetch('/api/weekly-reports/primary-posts?isActive=true');
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setPrimaryPosts(data);
          setCache('weekly_reports_primary_posts', data);
          
          const statusMap: Record<string, TeacherCompletionStatus[]> = {};
          for (const post of data) {
            try {
              const statusResponse = await fetch(`/api/weekly-reports/tracking?primaryPostId=${post.id}`);
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                statusMap[post.id] = statusData;
              }
            } catch (error) {
              console.error(`Error fetching status for post ${post.id}:`, error);
            }
          }
          setCompletionStatusMap(statusMap);
          setCache('weekly_reports_completion_status_map', statusMap);
          
          if (data.length > 0) {
            setSelectedPrimaryPost(data[0]);
          }
        }
      } else {
        const errorData = await response.json();
        alert(`Error creating assignment: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating primary post:', error);
      alert('Error creating assignment. Please check console for details.');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleUpdatePrimaryPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPrimaryPost || !editPostTitle.trim() || !editPostDescription.trim() || !editPostDueDate) return;

    setIsCreatingPost(true);
    try {
      const uploadedAttachments = await uploadFiles();
      const finalAttachments = uploadedAttachments.length === 0 
        ? selectedPrimaryPost.attachments || [] 
        : uploadedAttachments;

      const response = await fetch('/api/weekly-reports/primary-posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPrimaryPost.id,
          title: editPostTitle.trim(),
          description: editPostDescription.trim(),
          dueDate: editPostDueDate,
          attachments: finalAttachments
        })
      });

      if (response.ok) {
        alert('Assignment updated successfully.');
        setIsEditing(false);
        setAttachedFiles([]);
        clearCache('weekly_reports_primary_posts');
        
        const fetchResponse = await fetch('/api/weekly-reports/primary-posts?isActive=true');
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setPrimaryPosts(data);
          setCache('weekly_reports_primary_posts', data);
          
          const updatedPost = data.find((p: WeeklyReportPrimaryPost) => p.id === selectedPrimaryPost.id);
          if (updatedPost) setSelectedPrimaryPost(updatedPost);
        }
      } else {
        const errorData = await response.json();
        alert(`Error updating assignment: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Error updating assignment. Please check console for details.');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleDeletePrimaryPost = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this assignment?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/weekly-reports/primary-posts?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Assignment deleted successfully.');
        setIsEditing(false);
        setSelectedPrimaryPost(null);
        clearCache('weekly_reports_primary_posts');
        
        const fetchResponse = await fetch('/api/weekly-reports/primary-posts?isActive=true');
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setPrimaryPosts(data);
          setCache('weekly_reports_primary_posts', data);
          if (data.length > 0) {
            setSelectedPrimaryPost(data[0]);
          }
        }
      } else {
        alert('Failed to delete assignment.');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Error deleting assignment. Please check console for details.');
    }
  };

  const handleAcknowledgeSubPost = async (subPostId: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/weekly-reports/sub-posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subPostId,
          acknowledged: true,
          acknowledgedBy: currentUser.id
        })
      });

      if (response.ok) {
        if (selectedPrimaryPost) {
          clearCache(`weekly_reports_sub_posts_${selectedPrimaryPost.id}`);
          clearCache(`weekly_reports_completion_status_${selectedPrimaryPost.id}`);
        }
        
        const fetchResponse = await fetch(`/api/weekly-reports/sub-posts?primaryPostId=${selectedPrimaryPost?.id}`);
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setSubPosts(data);
          if (selectedPrimaryPost) {
            setCache(`weekly_reports_sub_posts_${selectedPrimaryPost.id}`, data);
          }
        }
        
        if (selectedPrimaryPost) {
          const statusResponse = await fetch(`/api/weekly-reports/tracking?primaryPostId=${selectedPrimaryPost.id}`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            setCompletionStatus(statusData);
            setCompletionStatusMap(prev => ({
              ...prev,
              [selectedPrimaryPost.id]: statusData
            }));
            setCache(`weekly_reports_completion_status_${selectedPrimaryPost.id}`, statusData);
          }
        }
      }
    } catch (error) {
      console.error('Error acknowledging sub-post:', error);
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
      <PrincipalLayout title="Weekly Reports" subtitle="Loading data...">
        <PrincipalSkeleton />
      </PrincipalLayout>
    );
  }

  if (!currentUser) {
    return (
      <PrincipalLayout title="Weekly Reports" subtitle="Please log in to view reports">
        <div className="text-center py-12">
          <p className="text-gray-600">Please log in to access weekly reports.</p>
        </div>
      </PrincipalLayout>
    );
  }

  return (
    <PrincipalLayout 
      title="Weekly Reports" 
      subtitle="Create weekly report requests and track teacher submissions"
    >
      <div className="flex flex-col gap-6">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Weekly Report Assignments</h2>
              <p className="text-sm text-gray-600 mt-1">Create assignments and track teacher submissions</p>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setIsEditing(false);
                setAttachedFiles([]);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              New Assignment
            </button>
          </div>

          {(showCreateForm || isEditing) && (
            <form onSubmit={isEditing ? handleUpdatePrimaryPost : handleCreatePrimaryPost} className="mt-6 border-t border-gray-200 pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editPostTitle : newPostTitle}
                    onChange={(e) => isEditing ? setEditPostTitle(e.target.value) : setNewPostTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Weekly Report - Week 6"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={isEditing ? editPostDescription : newPostDescription}
                    onChange={(e) => isEditing ? setEditPostDescription(e.target.value) : setNewPostDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    rows={4}
                    placeholder="Describe what teachers should include in their weekly report..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={isEditing ? editPostDueDate : newPostDueDate}
                    onChange={(e) => isEditing ? setEditPostDueDate(e.target.value) : setNewPostDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                {/* Attached Files List */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="font-medium text-gray-600 text-sm">Attached Files:</p>
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2 rounded-lg">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileIcon size={16} className="text-blue-500 shrink-0" />
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

                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
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
                      className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 text-sm w-full sm:w-auto"
                    >
                      <Paperclip size={18} />
                      Attach File
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isCreatingPost || isUploading}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
                    >
                      {isCreatingPost || isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          {isUploading ? 'Uploading...' : isEditing ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          {isEditing ? 'Update Assignment' : 'Create Assignment'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setIsEditing(false);
                        setAttachedFiles([]);
                      }}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {primaryPosts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Assignments</h2>
            <div className="space-y-3">
              {primaryPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPrimaryPost(post)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedPrimaryPost?.id === post.id
                      ? 'bg-purple-50 border-purple-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 break-words">{post.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 break-words whitespace-pre-wrap">{post.description}</p>
                      
                      {/* Attached Files display for Assignment */}
                      {post.attachments && post.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {post.attachments.map((file, idx) => (
                            <a
                              key={idx}
                              href={typeof file === " string\ ? file : file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-50 transition-colors"
                            >
                              <Paperclip size={12} />
                              {file.name}
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1 shrink-0">
                          <Calendar size={14} />
                          Due: {formatDate(post.dueDate)}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Users size={14} />
                          {completionStatusMap[post.id]?.filter(s => s.hasSubmitted).length || 0} / {completionStatusMap[post.id]?.length || 0} Submitted
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 pt-1">
                      {selectedPrimaryPost?.id === post.id && (
                        <div className="flex items-center gap-2 mr-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditPostTitle(post.title);
                              setEditPostDescription(post.description);
                              setEditPostDueDate(post.dueDate);
                              setAttachedFiles([]);
                              setIsEditing(true);
                              setShowCreateForm(false);
                            }}
                            className="text-purple-600 hover:text-purple-800 bg-white p-1.5 rounded border border-purple-200"
                            title="Edit Assignment"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePrimaryPost(post.id);
                            }}
                            className="text-red-600 hover:text-red-800 bg-white p-1.5 rounded border border-red-200"
                            title="Delete Assignment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                      <CheckCircle2 
                        size={20} 
                        className={selectedPrimaryPost?.id === post.id ? 'text-purple-600' : 'text-gray-400'}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPrimaryPost && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} className="text-purple-600" />
                Teacher Completion Status
              </h2>
              <div className="space-y-2">
                {isFetchingTracking ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 bg-gray-100 rounded-lg border border-gray-200"></div>
                    ))}
                  </div>
                ) : completionStatus.length === 0 ? (
                  <p className="text-gray-500 text-sm">No teachers found.</p>
                ) : (
                  completionStatus.map((status) => (
                    <div
                      key={status.teacherId}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        {status.hasSubmitted ? (
                          <CheckCircle2 size={20} className="text-green-600" />
                        ) : (
                          <Circle size={20} className="text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{status.teacherName}</p>
                          {status.submittedAt && (
                            <p className="text-xs text-gray-500">
                              Submitted: {formatDateTime(status.submittedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {status.hasSubmitted ? (
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                            Completed
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{isFetchingTracking ? '-' : completionStatus.length}</p>
                    <p className="text-xs text-gray-600">Total Teachers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {isFetchingTracking ? '-' : completionStatus.filter(s => s.hasSubmitted).length}
                    </p>
                    <p className="text-xs text-gray-600">Submitted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {isFetchingTracking ? '-' : completionStatus.filter(s => !s.hasSubmitted).length}
                    </p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-purple-600" />
                Submitted Reports
              </h2>
              <div className="space-y-4">
                {isFetchingSubPosts ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-28 bg-gray-100 rounded-lg border border-gray-200"></div>
                    ))}
                  </div>
                ) : subPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">No reports submitted yet.</p>
                  </div>
                ) : (
                  subPosts.map((subPost) => (
                    <div key={subPost.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">{subPost.teacherName}</p>
                          <p className="text-xs text-gray-500">{formatDateTime(subPost.submittedAt)}</p>
                        </div>
                        {subPost.acknowledged ? (
                          <span className="flex items-center text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            <CheckCircle size={12} className="mr-1" />
                            Acknowledged
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAcknowledgeSubPost(subPost.id)}
                            className="flex items-center text-xs text-purple-700 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded transition-colors"
                          >
                            <CheckCircle size={12} className="mr-1" />
                            Acknowledge
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{subPost.content}</p>
                      {subPost.attachments && subPost.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-600 mb-2">Attachments:</p>
                          <div className="flex flex-wrap gap-2">
                            {subPost.attachments.map((file, idx) => (
                              <a
                                key={idx}
                                href={typeof file === " string\ ? file : file.url}
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PrincipalLayout>
  );
}
