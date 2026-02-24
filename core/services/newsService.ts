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
  private baseUrl = '/api/news'

  async getAll(): Promise<NewsItem[]> {
    const response = await fetch(this.baseUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch news')
    }
    return response.json()
  }

  async add(data: CreateNewsData): Promise<NewsItem> {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('content', data.content)
    if (data.author) {
      formData.append('author', data.author)
    }
    if (data.imageFile) {
      formData.append('image', data.imageFile)
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to create news')
    }

    return response.json()
  }

  async update(data: UpdateNewsData): Promise<NewsItem> {
    const formData = new FormData()
    formData.append('id', data.id)
    formData.append('title', data.title)
    formData.append('content', data.content)
    if (data.author) {
      formData.append('author', data.author)
    }
    if (data.imageFile) {
      formData.append('image', data.imageFile)
    }
    if (data.previousImagePath) {
      formData.append('previousImagePath', data.previousImagePath)
    }

    const response = await fetch(`${this.baseUrl}/${data.id}`, {
      method: 'PUT',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to update news')
    }

    return response.json()
  }

  async remove(id: string, imagePath?: string): Promise<void> {
    const formData = new FormData()
    if (imagePath) {
      formData.append('imagePath', imagePath)
    }

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to delete news')
    }
  }
}

export const newsService = new NewsService()
