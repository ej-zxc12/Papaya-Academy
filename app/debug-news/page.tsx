'use client'

import { useState, useEffect } from 'react'
import { getNewsArticles, NewsArticle } from '@/lib/news'

export default function DebugNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testFetch = async () => {
      try {
        console.log('Starting fetch...')
        const data = await getNewsArticles()
        console.log('Fetched data:', data)
        setArticles(data)
        setLoading(false)
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    testFetch()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug: News Articles</h1>
        
        {loading && (
          <div className="bg-blue-100 p-4 rounded">
            <p>Loading articles...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 p-4 rounded">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="bg-green-100 p-4 rounded mb-6">
            <p className="font-bold">Success! Found {articles.length} articles</p>
          </div>
        )}
        
        <div className="space-y-4">
          {articles.map((article, index) => (
            <div key={article.id} className="bg-white p-4 rounded shadow border">
              <h3 className="font-bold text-lg">{article.title}</h3>
              <p className="text-sm text-gray-600">ID: {article.id} | Slug: {article.slug}</p>
              <p className="text-sm text-gray-600">Author: {article.author || 'N/A'}</p>
              <p className="text-sm text-gray-600">Created: {article.created_at}</p>
              <p className="text-sm text-gray-500 mt-2">{article.content?.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Environment Variables Check:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
