import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, orderBy, where } from 'firebase/firestore';

export interface NewsArticle {
  id: string // Document ID in Firestore
  title: string
  slug: string
  excerpt?: string
  content: string
  author?: string
  featured_image?: string
  status?: string
  published_at?: string
  created_at?: string
}

export async function getNewsArticles(): Promise<NewsArticle[]> {
  try {
    console.log('Fetching news articles from Firebase...');
    
    const newsRef = collection(db, 'news_articles');
    const q = query(newsRef, orderBy('published_at', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const articles: NewsArticle[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      articles.push({
        id: doc.id,
        ...data
      } as NewsArticle);
    });
    
    // Filter for published articles
    const filteredArticles = articles.filter((article: NewsArticle) => 
      !article.status || article.status === 'Published'
    );
    
    console.log(`Fetched ${filteredArticles.length} published articles from ${articles.length} total`);
    return filteredArticles;
  } catch (error) {
    console.error('Error fetching news articles:', error);
    throw new Error(`Firebase fetch error: ${error}`);
  }
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    console.log('Fetching article by slug:', slug);
    
    const newsRef = collection(db, 'news_articles');
    const q = query(newsRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('Article not found');
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data
    } as NewsArticle;
  } catch (error) {
    console.error('Error fetching news article:', error);
    throw new Error(`Firebase fetch error: ${error}`);
  }
}

export async function getNewsArticleById(id: string): Promise<NewsArticle | null> {
  try {
    console.log('Fetching article by ID:', id);
    
    const docRef = doc(db, 'news_articles', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('Article not found');
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data
    } as NewsArticle;
  } catch (error) {
    console.error('Error fetching news article by ID:', error);
    return null;
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
