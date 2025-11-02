import { supabase } from './supabase'
import type { FlashcardSet, Flashcard, Review } from '@/types'

// Flashcard Sets CRUD
export async function getFlashcardSets(userId: string) {
  const { data, error } = await supabase
    .from('flashcard_sets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function createFlashcardSet(set: Omit<FlashcardSet, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('flashcard_sets')
    .insert([set])
    .select()
    .single()
  
  return { data, error }
}

export async function updateFlashcardSet(id: string, updates: Partial<FlashcardSet>) {
  const { data, error } = await supabase
    .from('flashcard_sets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function deleteFlashcardSet(id: string) {
  const { error } = await supabase
    .from('flashcard_sets')
    .delete()
    .eq('id', id)
  
  return { error }
}

// Flashcards CRUD
export async function getFlashcards(setId: string) {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('set_id', setId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function createFlashcard(flashcard: Omit<Flashcard, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('flashcards')
    .insert([flashcard])
    .select()
    .single()
  
  return { data, error }
}

export async function updateFlashcard(id: string, updates: Partial<Flashcard>) {
  const { data, error } = await supabase
    .from('flashcards')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function deleteFlashcard(id: string) {
  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', id)
  
  return { error }
}

// Reviews CRUD
export async function getReview(flashcardId: string, userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('flashcard_id', flashcardId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  return { data, error }
}

export async function createReview(review: Omit<Review, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single()
  
  return { data, error }
}

export async function updateReview(id: string, updates: Partial<Review>) {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

// Get cards due for review
export async function getDueFlashcards(userId: string, setId?: string) {
  let query = supabase
    .from('reviews')
    .select(`
      *,
      flashcards (
        *,
        flashcard_sets (*)
      )
    `)
    .eq('user_id', userId)
    .lte('next_review', new Date().toISOString())
  
  if (setId) {
    query = query.eq('flashcards.set_id', setId)
  }
  
  const { data, error } = await query
  return { data, error }
}
