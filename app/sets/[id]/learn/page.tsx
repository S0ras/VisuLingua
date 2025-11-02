'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getCurrentUser } from '@/lib/auth'
import { getFlashcards, getReview, createReview, updateReview } from '@/lib/database'
import { calculateNextReview } from '@/lib/srs'
import type { Flashcard } from '@/types'

export default function LearnPage() {
  const params = useParams()
  const setId = params.id as string
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
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
    setUserId(user.id)

    const { data } = await getFlashcards(setId)
    if (data) {
      // Shuffle cards for learning session
      const shuffled = [...data].sort(() => Math.random() - 0.5)
      setFlashcards(shuffled)
    }
    setLoading(false)
  }

  const handleQualityResponse = async (quality: number) => {
    if (!userId || !currentCard) return

    const { data: existingReview } = await getReview(currentCard.id, userId)

    const previousData = existingReview ? {
      easinessFactor: existingReview.easiness_factor,
      interval: existingReview.interval,
      repetitions: existingReview.repetitions,
      nextReview: new Date(existingReview.next_review),
    } : undefined

    const reviewData = calculateNextReview(quality, previousData)

    if (existingReview) {
      await updateReview(existingReview.id, {
        quality,
        easiness_factor: reviewData.easinessFactor,
        interval: reviewData.interval,
        repetitions: reviewData.repetitions,
        next_review: reviewData.nextReview.toISOString(),
      })
    } else {
      await createReview({
        flashcard_id: currentCard.id,
        user_id: userId,
        quality,
        easiness_factor: reviewData.easinessFactor,
        interval: reviewData.interval,
        repetitions: reviewData.repetitions,
        next_review: reviewData.nextReview.toISOString(),
      })
    }

    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
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

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center bg-white rounded-lg shadow p-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Keine Karteikarten zum Lernen</h2>
            <p className="text-gray-600 mb-6">
              Füge erst Karteikarten zu diesem Set hinzu
            </p>
            <Link
              href={`/sets/${setId}`}
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
            >
              Zurück zum Set
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]
  const progress = ((currentIndex + 1) / flashcards.length) * 100

  if (currentIndex >= flashcards.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center bg-white rounded-lg shadow p-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lerneinheit abgeschlossen!</h2>
            <p className="text-gray-600 mb-6">
              Du hast alle {flashcards.length} Karteikarten durchgearbeitet
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/sets/${setId}`}
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
              >
                Zurück zum Set
              </Link>
              <button
                onClick={() => {
                  setCurrentIndex(0)
                  setShowAnswer(false)
                  const shuffled = [...flashcards].sort(() => Math.random() - 0.5)
                  setFlashcards(shuffled)
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
              >
                Nochmal lernen
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href={`/sets/${setId}`} className="text-primary-600 hover:text-primary-700">
            ← Zurück zum Set
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Fortschritt</span>
            <span>{currentIndex + 1} / {flashcards.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6 min-h-[400px] flex flex-col justify-center items-center">
          {currentCard.image_url && (
            <div className="mb-6">
              <img
                src={currentCard.image_url}
                alt="Karteikarten-Bild"
                className="max-h-48 object-contain rounded"
              />
            </div>
          )}
          
          <div className="text-center w-full">
            <div className="text-sm text-gray-500 mb-4">
              {showAnswer ? 'Rückseite' : 'Vorderseite'}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-8">
              {showAnswer ? currentCard.back : currentCard.front}
            </div>
          </div>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 text-lg"
            >
              Antwort zeigen
            </button>
          ) : (
            <div className="w-full space-y-3">
              <p className="text-center text-sm text-gray-600 mb-4">
                Wie gut kanntest du die Antwort?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleQualityResponse(0)}
                  className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700"
                >
                  😕 Keine Ahnung (0)
                </button>
                <button
                  onClick={() => handleQualityResponse(2)}
                  className="bg-orange-500 text-white px-4 py-3 rounded-md hover:bg-orange-600"
                >
                  🤔 Schwer (2)
                </button>
                <button
                  onClick={() => handleQualityResponse(3)}
                  className="bg-yellow-500 text-white px-4 py-3 rounded-md hover:bg-yellow-600"
                >
                  😐 Ging so (3)
                </button>
                <button
                  onClick={() => handleQualityResponse(4)}
                  className="bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600"
                >
                  😊 Gut (4)
                </button>
                <button
                  onClick={() => handleQualityResponse(5)}
                  className="col-span-2 bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700"
                >
                  🎯 Perfekt (5)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">💡 Tipp:</p>
          <p>
            Bewerte ehrlich, wie gut du die Antwort kanntest. Das Spaced Repetition System 
            passt die Wiederholungsintervalle automatisch an deine Antworten an.
          </p>
        </div>
      </main>
    </div>
  )
}
