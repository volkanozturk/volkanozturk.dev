import { Document } from '@contentful/rich-text-types'
import type { Category } from '@/lib/categories'

// Blog Post (Contentful'dan gelecek)
export interface BlogPost {
  sys: {
    id: string
    createdAt: string
    updatedAt: string
  }
  fields: {
    title: string
    slug: string
    excerpt: string
    content: Document
    publishedDate: string
    /** Canonical value: engineering | notes | life. Required in the app model. */
    category: Category
    tags?: string[]
    coverImage?: ContentfulAsset
  }
}

// Journey (Kariyer Yolculuğu)
export interface JourneyEntry {
  sys: {
    id: string
  }
  fields: {
    company: string
    role: string
    startDate: string
    endDate?: string // boşsa "Hâlâ devam ediyor"
    description: string
    type: 'work' | 'education'
    location?: string
    url?: string
  }
}

// Bookmark
export interface Bookmark {
  sys: {
    id: string
  }
  fields: {
    title: string
    url: string
    description?: string
    collection: string
    tags?: string[]
  }
}

// Contentful Asset
export interface ContentfulAsset {
  fields: {
    title: string
    file: {
      url: string
      details: {
        size: number
        image?: {
          width: number
          height: number
        }
      }
      fileName: string
      contentType: string
    }
  }
}
