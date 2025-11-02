// Database Types
export interface User {
  id: string
  email: string
  created_at: string
}

export interface FlashcardSet {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Flashcard {
  id: string
  set_id: string
  front: string
  back: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  flashcard_id: string
  user_id: string
  quality: number // 0-5 (SM-2 algorithm)
  easiness_factor: number
  interval: number
  repetitions: number
  next_review: string
  created_at: string
}

// API Types
export interface OCRResult {
  text: string
  confidence: number
}

export interface TranslationResult {
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
}

export interface ImageGenerationResult {
  url: string
  prompt: string
}

// Component Props Types
export interface FlashcardProps {
  flashcard: Flashcard
  showAnswer: boolean
  onFlip: () => void
}

export interface SetCardProps {
  set: FlashcardSet
  cardCount: number
  onEdit: () => void
  onDelete: () => void
}
