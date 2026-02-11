'use client'

import { useState, useEffect } from 'react'

export default function TestConnectivityPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  useEffect(() => {
    const runTests = async () => {
      const results = []
      
      // Test 1: Basic fetch to Supabase URL
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          results.push('✅ Direct fetch to Supabase REST API: SUCCESS')
        } else {
          results.push(`❌ Direct fetch failed: HTTP ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        results.push(`❌ Direct fetch error: ${error instanceof Error ? error.message : 'Unknown'}`)
      }

      // Test 2: Check if URL is reachable
      try {
        const url = new URL(supabaseUrl)
        results.push(`✅ URL format: Valid (${url.protocol}//${url.host})`)
      } catch (error) {
        results.push(`❌ URL format: Invalid - ${error}`)
      }

      // Test 3: Environment variables
      results.push(`📍 Supabase URL: ${supabaseUrl}`)
      results.push(`🔑 Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}`)

      setTestResults(results)
    }

    runTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase Connectivity Test</h1>
        
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
            <li>Open your Supabase dashboard and verify the project URL matches exactly</li>
            <li>Check if your Supabase project is active/suspended</li>
            <li>Try accessing the Supabase URL directly in your browser</li>
            <li>Check if there are any firewall/network restrictions</li>
            <li>Verify the anon key is copied correctly from Supabase dashboard</li>
          </ol>
        </div>

        <div className="mt-6">
          <button 
            onClick={() => window.location.href = 'https://dfqralohvrjiqiambwm.supabase.co'}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Supabase URL in Browser
          </button>
        </div>
      </div>
    </div>
  )
}
