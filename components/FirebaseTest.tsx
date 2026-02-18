'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'

export default function FirebaseTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [projectInfo, setProjectInfo] = useState<any>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test 1: Check if Firebase is properly initialized
      if (!db) {
        throw new Error('Firebase not initialized')
      }

      // Test 2: Try to read from a test collection
      const testRef = collection(db, 'connection_tests')
      const querySnapshot = await getDocs(testRef)
      
      setProjectInfo({
        projectId: 'papayaacademy-system',
        dbStatus: 'Connected',
        collections: 'Available',
        testResults: querySnapshot.size + ' documents found'
      })

      setStatus('connected')
      setMessage('✅ Firebase connection is working!')
      
    } catch (error) {
      setStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setMessage(`❌ Connection failed: ${errorMessage}`)
      console.error('Firebase test error:', error)
    }
  }

  const testDatabaseWrite = async () => {
    try {
      const testRef = collection(db, 'connection_tests')
      const docRef = await addDoc(testRef, {
        test_name: 'Connection Test',
        created_at: serverTimestamp(),
        status: 'success'
      })
      
      setMessage(`✅ Database write test successful! Document ID: ${docRef.id}`)
    } catch (error) {
      setMessage(`❌ Database write test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Firebase Connection Test</h2>
      
      <div className="space-y-4">
        <div className={`p-4 rounded ${status === 'connected' ? 'bg-green-100' : status === 'error' ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <p className="font-semibold">{message}</p>
        </div>

        {projectInfo && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Project Information:</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Project ID:</strong> {projectInfo.projectId}</li>
              <li><strong>Database Status:</strong> {projectInfo.dbStatus}</li>
              <li><strong>Collections:</strong> {projectInfo.collections}</li>
              <li><strong>Test Results:</strong> {projectInfo.testResults}</li>
            </ul>
          </div>
        )}

        <div className="space-x-4">
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Connection Again
          </button>
          
          <button
            onClick={testDatabaseWrite}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Database Write
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">What this tests:</h3>
          <ul className="text-sm space-y-1">
            <li>• Firebase initialization</li>
            <li>• Network connectivity to your Firebase project</li>
            <li>• Firestore database access</li>
            <li>• Database write permissions (optional test)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
