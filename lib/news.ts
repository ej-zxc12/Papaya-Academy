import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Not Set')

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

export interface NewsArticle {
  id: string // UUID in your database
  title: string
  slug: string
  excerpt?: string // Added from your schema
  content: string
  author?: string
  featured_image?: string
  status?: string // Nullable in your schema
  published_at?: string // Nullable in your schema
  created_at?: string // Might not exist, but let's check
}

export async function getNewsArticles(): Promise<NewsArticle[]> {
  try {
    console.log('Testing Supabase connection...')
    console.log('Using URL:', supabaseUrl)
    
    // Test basic connection first
    const { data: testData, error: testError } = await supabase
      .from('news_articles')
      .select('count')
      .single()

    console.log('Connection test response:', { testData, testError })

    if (testError) {
      console.error('Basic connection test failed:', testError)
      
      // Check for specific error types
      if (testError.message?.includes('fetch') || testError.message?.includes('network')) {
        throw new Error(`Network error: Cannot reach Supabase at ${supabaseUrl}. Check URL and network connectivity.`)
      }
      
      if (testError.message?.includes('JWT') || testError.message?.includes('apikey')) {
        throw new Error(`Authentication error: Invalid Supabase credentials. Check your anon key.`)
      }
      
      if (testError.message?.includes('relation') || testError.message?.includes('does not exist')) {
        throw new Error(`Database error: 'news_articles' table doesn't exist or no RLS policy for public access.`)
      }
      
      throw new Error(`RLS/Permission error: ${testError.message || JSON.stringify(testError)}`)
    }

    console.log('Total articles count:', testData?.count)

    // Now fetch actual articles
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false })

    console.log('Supabase query result:', { data: data?.length, error })

    if (error) {
      console.error('Error fetching news articles:', error)
      throw new Error(`Supabase query error: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.log('No articles found in database')
      return []
    }

    // Filter for published articles on client side
    const filteredData = data.filter(article => 
      !article.status || article.status === 'Published'
    )

    console.log(`Filtered ${filteredData.length} published articles from ${data.length} total`)
    return filteredData
  } catch (error) {
    console.error('News fetch error:', error)
    throw error
  }
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    console.log('Fetching article by slug:', slug)
    
    const { data, error } = await supabase
      .from('news_articles')
      .select('*, published_at') // Include published_at
      .eq('slug', slug)
      .single()

    console.log('Article fetch result:', { data, error })

    if (error) {
      console.error('Error fetching news article:', error)
      
      // Handle specific error cases
      if (error.code === 'PGRST116') {
        console.log('Article not found (PGRST116)')
        return null
      }
      
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        throw new Error(`Network error: Cannot reach Supabase. Check URL and connectivity.`)
      }
      
      throw new Error(`Database error: ${error.message || JSON.stringify(error)}`)
    }

    return data
  } catch (error) {
    console.error('News article fetch error:', error)
    throw error // Re-throw to show the actual error
  }
}

export async function getNewsArticleById(id: string): Promise<NewsArticle | null> { // Changed to string for UUID
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', id) // UUID string
      .single()

    if (error) {
      console.error('Error fetching news article by ID:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('News article fetch error:', error)
    return null
  }
}

export function formatNewsDate(value: string | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncateContent(content: string, maxLength: number = 150): string {
  if (!content) return ''
  return content.length > maxLength ? `${content.slice(0, maxLength)}...` : content
}
