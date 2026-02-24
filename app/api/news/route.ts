import { NextRequest, NextResponse } from 'next/server'
import { db, storage } from '../../../lib/firebase-admin'
import { QueryDocumentSnapshot } from 'firebase-admin/firestore'

export async function GET() {
  try {
    const newsSnapshot = await db.collection('news').orderBy('date', 'desc').get()
    const newsItems = newsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(newsItems)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const author = formData.get('author') as string
    const imageFile = formData.get('image') as File | null

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    let imageUrl = ''
    let imagePath = ''

    if (imageFile) {
      const timestamp = Date.now()
      const filename = `news-${timestamp}-${imageFile.name}`
      const imageRef = storage.bucket().file(`news/${filename}`)
      
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      await imageRef.save(buffer, {
        metadata: {
          contentType: imageFile.type,
        },
      })
      
      imagePath = `news/${filename}`
      imageUrl = `https://storage.googleapis.com/${storage.bucket().name}/${imagePath}`
    }

    const newsData = {
      title,
      content,
      author: author || '',
      date: new Date().toISOString(),
      imagePath,
      imageUrl,
      createdAt: new Date().toISOString(),
    }

    const docRef = await db.collection('news').add(newsData)
    const newsItem = {
      id: docRef.id,
      ...newsData
    }

    return NextResponse.json(newsItem)
  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 })
  }
}
