import Image from 'next/image'
import Link from 'next/link'
import { NewsArticle, formatNewsDate, truncateContent } from '@/lib/news'

interface NewsArticleCardProps {
  article: NewsArticle
  showFullContent?: boolean
}

export default function NewsArticleCard({ article, showFullContent = false }: NewsArticleCardProps) {
  const imageUrl = article.featured_image || '/images/placeholder-news.jpg'
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {article.featured_image && (
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#1B3E2A] font-medium">
            {formatNewsDate(article.published_at || article.created_at)}
          </span>
          {article.author && (
            <span className="text-xs text-gray-500">By {article.author}</span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {article.title}
        </h3>
        
        <div className="text-gray-600 text-sm mb-4">
          {showFullContent ? (
            <div className="prose prose-sm max-w-none">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p>{truncateContent(article.content)}</p>
          )}
        </div>
        
        {!showFullContent && (
          <Link 
            href={`/news/${article.slug}`}
            className="inline-flex items-center text-[#1B3E2A] hover:text-[#163021] font-medium text-sm transition-colors"
          >
            Read More
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}
