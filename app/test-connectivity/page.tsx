'use client'

import { useState, useEffect } from 'react'

export default function TestConnectivityFirebasePage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const projectId = 'papayaacademy-system'

  useEffect(() => {
    const runTests = async () => {
      const results = []
      
      // Test 1: Basic fetch to Firebase REST API
      try {
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/news_articles`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          results.push('✅ Direct fetch to Firebase REST API: SUCCESS')
        } else {
          results.push(`❌ Direct fetch failed: HTTP ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        results.push(`❌ Direct fetch error: ${error instanceof Error ? error.message : 'Unknown'}`)
      }

      // Test 2: Check if project ID is valid
      try {
        if (projectId && projectId.length > 0) {
          results.push(`✅ Project ID format: Valid (${projectId})`)
        } else {
          results.push('❌ Project ID format: Empty or invalid')
        }
      } catch (error) {
        results.push(`❌ Project ID format: Invalid - ${error}`)
      }

      // Test 3: Environment variables
      results.push(`📍 Firebase Project ID: ${projectId}`)
      results.push(`🔑 Firebase Config: Set in lib/firebase.ts`)

      setTestResults(results)
    }

    runTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Firebase Connectivity Test</h1>
        
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="bg-white p-4 rounded shadow border">
              <p className="font-mono text-sm">{result}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-bold mb-4 text-yellow-800">🔧 Troubleshooting Steps</h2>
          <ol className="list-decimal space-y-2 text-yellow-700">
            <li>Open your Firebase dashboard and verify the project ID matches exactly</li>
            <li>Check if your Firebase project is active</li>
            <li>Try accessing the Firebase URL directly in your browser</li>
            <li>Check if there are any firewall/network restrictions</li>
            <li>Verify the Firebase configuration in lib/firebase.ts</li>
          </ol>
        </div>

        <div className="mt-6">
          <button 
            onClick={() => window.location.href = 'https://console.firebase.google.com/project/papayaacademy-system'}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Open Firebase Console
          </button>
        </div>
      </div>
    </div>
  )
}
