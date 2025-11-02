'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getCurrentUser } from '@/lib/auth'
import { getFlashcardSets, getFlashcards, deleteFlashcardSet, updateFlashcardSet } from '@/lib/database'
import type { FlashcardSet, Flashcard } from '@/types'

export default function SetDetailPage() {
  const params = useParams()
  const setId = params.id as string
  const [set, setSet] = useState<FlashcardSet | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [setId])

  const loadData = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Load set details
    const { data: setsData } = await getFlashcardSets(user.id)
    const currentSet = setsData?.find(s => s.id === setId)
    
    if (currentSet) {
      setSet(currentSet)
      setEditName(currentSet.name)
      setEditDescription(currentSet.description || '')
    }

    // Load flashcards
    const { data: cardsData } = await getFlashcards(setId)
    if (cardsData) {
      setFlashcards(cardsData)
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Möchtest du dieses Set wirklich löschen? Alle Karteikarten werden ebenfalls gelöscht.')) {
      return
    }

    const { error } = await deleteFlashcardSet(setId)
    if (!error) {
      router.push('/dashboard')
    }
  }

  const handleUpdate = async () => {
    const { error } = await updateFlashcardSet(setId, {
      name: editName,
      description: editDescription,
    })
    
    if (!error) {
      setIsEditing(false)
      loadData()
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

  if (!set) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Set nicht gefunden</h2>
            <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
              Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Zurück zu Meine Sets
          </Link>
          
          {isEditing ? (
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-3xl font-bold w-full mb-2 px-2 py-1 border border-gray-300 rounded"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded"
                rows={2}
              />
              <div className="flex gap-2 mt-4">
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
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{set.name}</h1>
                  {set.description && (
                    <p className="mt-2 text-gray-600">{set.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary-600 hover:text-primary-700 px-4 py-2"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 px-4 py-2"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {flashcards.length} {flashcards.length === 1 ? 'Karteikarte' : 'Karteikarten'}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/sets/${setId}/learn`}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              🧠 Lernen starten
            </Link>
            <Link
              href={`/sets/${setId}/cards/new`}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              + Neue Karte
            </Link>
          </div>
        </div>

        {flashcards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Noch keine Karteikarten
            </h3>
            <p className="text-gray-600 mb-6">
              Füge deine erste Karteikarte hinzu oder scanne ein Bild
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href={`/sets/${setId}/cards/new`}
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
              >
                Karte erstellen
              </Link>
              <Link
                href="/scan"
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
              >
                📸 Bild scannen
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((card) => (
              <Link
                key={card.id}
                href={`/sets/${setId}/cards/${card.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Vorderseite:</div>
                  <div className="font-semibold text-gray-900">{card.front}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Rückseite:</div>
                  <div className="text-gray-700">{card.back}</div>
                </div>
                {card.image_url && (
                  <div className="mt-4">
                    <img
                      src={card.image_url}
                      alt="Karteikarten-Bild"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
