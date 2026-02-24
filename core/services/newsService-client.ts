import { db, storage } from '../../lib/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

export interface NewsItem {
  id: string
  title: string
  content: string
  author?: string
  date?: string
  imagePath?: string
  imageUrl?: string
}

export interface CreateNewsData {
  title: string
  content: string
  author?: string
  imageFile?: File | null
}

export interface UpdateNewsData extends CreateNewsData {
  id: string
  previousImagePath?: string
}

class NewsService {
  async getAll(): Promise<NewsItem[]> {
    const newsRef = collection(db, 'news')
    const q = query(newsRef, orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NewsItem))
  }

  async add(data: CreateNewsData): Promise<NewsItem> {
    let imageUrl = ''
    let imagePath = ''

    if (data.imageFile) {
      const timestamp = Date.now()
      const filename = `news-${timestamp}-${data.imageFile.name}`
      const imageRef = ref(storage, `news/${filename}`)
      
      await uploadBytes(imageRef, data.imageFile)
      imageUrl = await getDownloadURL(imageRef)
      imagePath = `news/${filename}`
    }

    const newsData = {
      title: data.title,
      content: data.content,
      author: data.author || '',
      date: new Date().toISOString(),
      imagePath,
      imageUrl,
      createdAt: new Date().toISOString(),
    }

    const docRef = await addDoc(collection(db, 'news'), newsData)
    return {
      id: docRef.id,
      ...newsData
    }
  }

  async update(data: UpdateNewsData): Promise<NewsItem> {
    let imageUrl = ''
    let imagePath = data.previousImagePath || ''

    if (data.imageFile) {
      // Delete previous image if it exists
      if (data.previousImagePath) {
        try {
          const previousImageRef = ref(storage, data.previousImagePath)
          await deleteObject(previousImageRef)
        } catch (error) {
          console.warn('Failed to delete previous image:', error)
        }
      }

      const timestamp = Date.now()
      const filename = `news-${timestamp}-${data.imageFile.name}`
      const imageRef = ref(storage, `news/${filename}`)
      
      await uploadBytes(imageRef, data.imageFile)
      imageUrl = await getDownloadURL(imageRef)
      imagePath = `news/${filename}`
    } else {
      // Keep existing image URL if no new image is uploaded
      const existingDoc = await getDoc(doc(db, 'news', data.id))
      if (existingDoc.exists()) {
        const existingData = existingDoc.data()
        imageUrl = existingData?.imageUrl || ''
      }
    }

    const newsData = {
      title: data.title,
      content: data.content,
      author: data.author || '',
      date: new Date().toISOString(),
      imagePath,
      imageUrl,
      updatedAt: new Date().toISOString(),
    }

    await updateDoc(doc(db, 'news', data.id), newsData)
    return {
      id: data.id,
      ...newsData
    }
  }

  async remove(id: string, imagePath?: string): Promise<void> {
    // Delete image if it exists
    if (imagePath) {
      try {
        const imageRef = ref(storage, imagePath)
        await deleteObject(imageRef)
      } catch (error) {
        console.warn('Failed to delete image:', error)
      }
    }

    await deleteDoc(doc(db, 'news', id))
  }
}

export const newsService = new NewsService()
