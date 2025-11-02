'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getFlashcards, updateFlashcard, deleteFlashcard } from '@/lib/database'
import type { Flashcard } from '@/types'

export default function CardDetailPage() {
  const params = useParams()
  const setId = params.id as string
  const cardId = params.cardId as string
  const [card, setCard] = useState<Flashcard | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editFront, setEditFront] = useState('')
  const [editBack, setEditBack] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadCard()
  }, [cardId])

  const loadCard = async () => {
    const { data } = await getFlashcards(setId)
    const currentCard = data?.find(c => c.id === cardId)
    
    if (currentCard) {
      setCard(currentCard)
      setEditFront(currentCard.front)
      setEditBack(currentCard.back)
    }

    setLoading(false)
  }

  const handleUpdate = async () => {
    const { error } = await updateFlashcard(cardId, {
      front: editFront,
      back: editBack,
    })
    
    if (!error) {
      setIsEditing(false)
      loadCard()
    }
  }

  const handleDelete = async () => {
    if (!confirm('Möchtest du diese Karteikarte wirklich löschen?')) {
      return
    }

    const { error } = await deleteFlashcard(cardId)
    if (!error) {
      router.push(`/sets/${setId}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Karte nicht gefunden</h2>
            <Link href={`/sets/${setId}`} className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
              Zurück zum Set
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href={`/sets/${setId}`} className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Zurück zum Set
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vorderseite (Spanisch)
                </label>
                <input
                  type="text"
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rückseite (Deutsch)
                </label>
                <input
                  type="text"
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Speichern
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">Vorderseite:</div>
                <div className="text-2xl font-bold text-gray-900 mb-6">{card.front}</div>
                
                <div className="text-sm text-gray-500 mb-2">Rückseite:</div>
                <div className="text-xl text-gray-700">{card.back}</div>
              </div>

              {card.image_url && (
                <div className="mb-6">
                  <img
                    src={card.image_url}
                    alt="Karteikarten-Bild"
                    className="w-full max-h-96 object-contain rounded"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Löschen
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
