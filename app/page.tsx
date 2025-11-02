import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          📚 VisuLingua
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8">
          Lerne Spanisch durch Scannen von Texten aus deiner Umgebung
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-3">📸</div>
            <h3 className="text-lg font-semibold mb-2">Scannen</h3>
            <p className="text-gray-600 text-sm">
              Fotografiere spanische Texte und erkenne sie automatisch mit OCR
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-3">�</div>
            <h3 className="text-lg font-semibold mb-2">Übersetzen</h3>
            <p className="text-gray-600 text-sm">
              Automatische Übersetzung ins Deutsche mit AWS Translate
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="text-lg font-semibold mb-2">Lernen</h3>
            <p className="text-gray-600 text-sm">
              Intelligentes Spaced Repetition System für effektives Lernen
            </p>
          </div>
        </div>
        
        <div className="space-x-4">
          <Link
            href="/register"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Jetzt starten
          </Link>
          <Link
            href="/login"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors border-2 border-primary-600"
          >
            Anmelden
          </Link>
        </div>
      </div>
    </main>
  )
}
