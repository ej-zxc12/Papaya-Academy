import { NextRequest, NextResponse } from 'next/server'
import { db, storage } from '../../../../lib/firebase-admin'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const author = formData.get('author') as string
    const imageFile = formData.get('image') as File | null
    const previousImagePath = formData.get('previousImagePath') as string

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    let imageUrl = ''
    let imagePath = previousImagePath || ''

    if (imageFile) {
      // Delete previous image if it exists
      if (previousImagePath) {
        try {
          await storage.bucket().file(previousImagePath).delete()
        } catch (error) {
          console.warn('Failed to delete previous image:', error)
        }
      }

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
    } else {
      // Keep existing image URL if no new image is uploaded
      const existingDoc = await db.collection('news').doc(id).get()
      if (existingDoc.exists) {
        const existingData = existingDoc.data()
        imageUrl = existingData?.imageUrl || ''
      }
    }

    const newsData = {
      title,
      content,
      author: author || '',
      date: new Date().toISOString(),
      imagePath,
      imageUrl,
      updatedAt: new Date().toISOString(),
    }

    await db.collection('news').doc(id).update(newsData)
    const newsItem = {
      id,
      ...newsData
    }

    return NextResponse.json(newsItem)
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const formData = await request.formData()
    const imagePath = formData.get('imagePath') as string

    // Delete image if it exists
    if (imagePath) {
      try {
        await storage.bucket().file(imagePath).delete()
      } catch (error) {
        console.warn('Failed to delete image:', error)
      }
    }

    await db.collection('news').doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 })
  }
}
