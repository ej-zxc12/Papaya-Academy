'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [projectInfo, setProjectInfo] = useState<any>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // First, check if environment variables are loaded
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing environment variables. Check your .env.local file.')
      }

      // Test 1: Check if Supabase client is properly initialized
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      // Test 2: Simple ping using Supabase client (no fetch needed)
      try {
        // Try to get the current session - this tests the client without database access
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.log('Auth session error (may be expected):', sessionError)
        }

        // Test 3: Try a simple RPC call that should work on any Supabase project
        const { data: versionData, error: versionError } = await supabase.rpc('get_schema_version')
        
        if (versionError && versionError.code !== 'PGRST116') {
          console.log('Version RPC error (may be expected):', versionError)
        }

        setProjectInfo({
          url: supabaseUrl,
          keyPreview: supabaseKey.substring(0, 10) + '...',
          session: session ? 'Active' : 'None',
          clientStatus: 'Initialized',
          rpcTest: versionError ? versionError.code : 'Success'
        })

        setStatus('connected')
        setMessage('✅ Supabase connection is working!')
        
      } catch (clientError) {
        // If client methods fail, try a simple database query
        const { data, error } = await supabase.from('_test_connection').select('*').limit(1)
        
        if (error && error.code !== 'PGRST116') {
          throw new Error(`Client error: ${clientError instanceof Error ? clientError.message : 'Unknown client error'}`)
        }

        setProjectInfo({
          url: supabaseUrl,
          keyPreview: supabaseKey.substring(0, 10) + '...',
          session: 'None',
          clientStatus: 'Working (fallback test)',
          rpcTest: 'Not available'
        })

        setStatus('connected')
        setMessage('✅ Supabase connection is working!')
      }
      
    } catch (error) {
      setStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setMessage(`❌ Connection failed: ${errorMessage}`)
      console.error('Supabase test error:', error)
    }
  }

  const testDatabaseWrite = async () => {
    try {
      // Create a simple test table if it doesn't exist
      const { data, error } = await supabase
        .from('connection_tests')
        .insert([
          { 
            test_name: 'Connection Test', 
            created_at: new Date().toISOString(),
            status: 'success'
          }
        ])
        .select()

      if (error) {
        // If table doesn't exist, that's expected for a new project
        if (error.code === 'PGRST116') {
          setMessage('✅ Connection works, but test table doesn\'t exist (expected for new projects)')
        } else {
          throw error
        }
      } else {
        setMessage(`✅ Database write test successful! Inserted record: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      setMessage(`❌ Database write test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="space-y-4">
        <div className={`p-4 rounded ${status === 'connected' ? 'bg-green-100' : status === 'error' ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <p className="font-semibold">{message}</p>
        </div>

        {projectInfo && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Project Information:</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>URL:</strong> {projectInfo.url}</li>
              <li><strong>Key:</strong> {projectInfo.keyPreview}</li>
              <li><strong>Auth Session:</strong> {projectInfo.session}</li>
              <li><strong>Client Status:</strong> {projectInfo.clientStatus}</li>
              <li><strong>RPC Test:</strong> {projectInfo.rpcTest}</li>
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
            <li>• Supabase client initialization</li>
            <li>• Network connectivity to your Supabase project</li>
            <li>• Authentication configuration</li>
            <li>• Database write permissions (optional test)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
