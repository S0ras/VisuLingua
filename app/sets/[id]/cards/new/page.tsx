'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createFlashcard } from '@/lib/database'

export default function NewCardPage() {
  const params = useParams()
  const setId = params.id as string
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: createError } = await createFlashcard({
      set_id: setId,
      front,
      back,
    })

    if (createError) {
      setError(createError.message)
      setLoading(false)
    } else if (data) {
      router.push(`/sets/${setId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Neue Karteikarte erstellen</h1>
          <p className="mt-2 text-gray-600">
            Füge eine neue Karteikarte zu deinem Set hinzu
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-2">
                Vorderseite (Spanisch) *
              </label>
              <input
                type="text"
                id="front"
                required
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="z.B. Hola"
              />
            </div>

            <div>
              <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-2">
                Rückseite (Deutsch) *
              </label>
              <input
                type="text"
                id="back"
                required
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="z.B. Hallo"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Erstelle Karte...' : 'Karte erstellen'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
