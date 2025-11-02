'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getCurrentUser } from '@/lib/auth'
import { getFlashcardSets } from '@/lib/database'
import type { FlashcardSet } from '@/types'

export default function DashboardPage() {
  const [sets, setSets] = useState<FlashcardSet[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewSetModal, setShowNewSetModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    loadSets(user.id)
  }

  const loadSets = async (userId: string) => {
    const { data, error } = await getFlashcardSets(userId)
    if (!error && data) {
      setSets(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meine Karteikarten-Sets</h1>
          <p className="mt-2 text-gray-600">
            Verwalte deine Lernsets und erstelle neue Karteikarten
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Lade Sets...</p>
          </div>
        ) : sets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Noch keine Sets vorhanden
            </h3>
            <p className="text-gray-600 mb-6">
              Erstelle dein erstes Karteikarten-Set oder scanne ein Bild
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/sets/new"
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
              >
                Neues Set erstellen
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
          <>
            <div className="mb-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {sets.length} {sets.length === 1 ? 'Set' : 'Sets'} gefunden
              </div>
              <Link
                href="/sets/new"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                + Neues Set
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sets.map((set) => (
                <Link
                  key={set.id}
                  href={`/sets/${set.id}`}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {set.name}
                  </h3>
                  {set.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {set.description}
                    </p>
                  )}
                  <div className="text-sm text-gray-500">
                    Erstellt am {new Date(set.created_at).toLocaleDateString('de-DE')}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
