'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getCurrentUser } from '@/lib/auth'
import { getFlashcardSets, createFlashcard } from '@/lib/database'
import type { FlashcardSet } from '@/types'

export default function ScanPage() {
  const [step, setStep] = useState<'camera' | 'processing' | 'review'>('camera')
  const [image, setImage] = useState<string | null>(null)
  const [ocrText, setOcrText] = useState('')
  const [translation, setTranslation] = useState('')
  const [selectedSet, setSelectedSet] = useState('')
  const [sets, setSets] = useState<FlashcardSet[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [useCamera, setUseCamera] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    loadSets()
  }, [])

  const loadSets = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    const { data } = await getFlashcardSets(user.id)
    if (data) {
      setSets(data)
      if (data.length > 0) {
        setSelectedSet(data[0].id)
      }
    }
  }

  const startCamera = async () => {
    try {
      setError('') // Clear previous errors
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera wird von diesem Browser nicht unterstützt')
      }
      
      // iOS-kompatible Kamera-Einstellungen
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      }
      
      console.log('Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Camera access granted:', stream.getVideoTracks().length, 'tracks')
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setUseCamera(true)
        
        // Wait for metadata to load
        videoRef.current.onloadedmetadata = async () => {
          console.log('Video metadata loaded:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
          
          // iOS benötigt expliziten play() Aufruf
          try {
            if (videoRef.current) {
              await videoRef.current.play()
              console.log('Video playing successfully')
            }
          } catch (playError) {
            console.error('Autoplay error:', playError)
            // Try to play on user interaction
            setError('Tippe auf "Kamera öffnen" erneut, falls das Bild nicht erscheint.')
          }
        }
      }
    } catch (err: any) {
      console.error('Camera error:', err)
      const errorMessage = err.message || 'Unbekannter Fehler'
      setError(`Kamera-Zugriff fehlgeschlagen: ${errorMessage}. Bitte verwende den Datei-Upload.`)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setUseCamera(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg')
      setImage(imageData)
      stopCamera()
      processImage(imageData)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageData = reader.result as string
        setImage(imageData)
        processImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = async (imageData: string) => {
    setStep('processing')
    setError('')
    setLoading(true)

    try {
      // Step 1: OCR
      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageData }),
      })

      if (!ocrResponse.ok) {
        throw new Error('OCR fehlgeschlagen')
      }

      const { text } = await ocrResponse.json()
      
      // Intelligente Wortextraktion: Wenn mehrere Wörter erkannt wurden,
      // nehme das längste/wichtigste Wort (kein Artikel, keine Präposition)
      const spanishStopWords = ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'y', 'en', 'a', 'con', 'para', 'por']
      const words = text.trim().split(/\s+/)
      
      let selectedWord = text
      if (words.length > 1) {
        // Filter Stopwörter und wähle das längste Wort
        const meaningfulWords = words.filter((w: string) => 
          !spanishStopWords.includes(w.toLowerCase()) && w.length > 2
        )
        if (meaningfulWords.length > 0) {
          selectedWord = meaningfulWords.reduce((a: string, b: string) => a.length > b.length ? a : b)
        }
      }
      
      setOcrText(selectedWord)

      // Step 2: Translation
      const translateResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: selectedWord, 
          sourceLanguage: 'es', 
          targetLanguage: 'de' 
        }),
      })

      if (!translateResponse.ok) {
        throw new Error('Übersetzung fehlgeschlagen')
      }

      const { translatedText } = await translateResponse.json()
      setTranslation(translatedText)

      setStep('review')
    } catch (err: any) {
      setError(err.message || 'Verarbeitung fehlgeschlagen')
      setStep('camera')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedSet) {
      setError('Bitte wähle ein Set aus')
      return
    }

    setLoading(true)
    const { error } = await createFlashcard({
      set_id: selectedSet,
      front: ocrText,
      back: translation,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/sets/${selectedSet}`)
    }
  }

  const reset = () => {
    setImage(null)
    setOcrText('')
    setTranslation('')
    setStep('camera')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Text scannen und übersetzen</h1>
          <p className="mt-2 text-gray-600">
            Fotografiere oder lade ein Bild mit spanischem Text hoch
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {step === 'camera' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              {useCamera ? (
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full"
                    style={{ 
                      maxHeight: '60vh',
                      minHeight: '40vh',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* iOS Fallback: Manual play button */}
                  {videoRef.current && videoRef.current.paused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <button
                        onClick={async () => {
                          try {
                            if (videoRef.current) {
                              await videoRef.current.play()
                              setError('')
                            }
                          } catch (e) {
                            setError('Bitte erlaube die Kamera-Nutzung in den Browser-Einstellungen')
                          }
                        }}
                        className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-gray-100"
                      >
                        ▶️ Kamera starten
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 text-lg font-semibold"
                    >
                      📸 Foto aufnehmen
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-6xl mb-4">📸</div>
                    <h3 className="text-lg font-semibold mb-2">Bild aufnehmen oder hochladen</h3>
                    <p className="text-gray-600 mb-6">
                      Verwende die Kamera oder lade ein Bild von deinem Gerät hoch
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={startCamera}
                        className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
                      >
                        📷 Kamera öffnen
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300"
                      >
                        📁 Datei hochladen
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Bild wird verarbeitet...</h3>
              <p className="text-gray-600">
                Text wird erkannt und übersetzt
              </p>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Karteikarte überprüfen</h2>
            
            {image && (
              <div className="mb-6">
                <img src={image} alt="Gescanntes Bild" className="w-full max-h-64 object-contain rounded" />
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vorderseite (Spanisch)
                </label>
                <textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rückseite (Deutsch)
                </label>
                <textarea
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set auswählen
                </label>
                {sets.length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    Du hast noch keine Sets. <a href="/sets/new" className="text-primary-600">Erstelle zuerst ein Set</a>
                  </p>
                ) : (
                  <select
                    value={selectedSet}
                    onChange={(e) => setSelectedSet(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    {sets.map((set) => (
                      <option key={set.id} value={set.id}>
                        {set.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={loading || !selectedSet}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Speichere...' : 'Karte speichern'}
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Neu scannen
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
