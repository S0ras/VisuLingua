import { NextRequest, NextResponse } from 'next/server'

// Temporäre Mock-Funktion für Development ohne AWS Textract
export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // MOCK: In Production würde hier Textract verwendet
    // Für Development geben wir einen Beispieltext zurück
    
    console.log('⚠️ DEVELOPMENT MODE: Using mock OCR response')
    console.log('💡 To use real AWS Textract, activate the service in your AWS Console')

    return NextResponse.json({
      text: 'Hola mundo', // Mock-Text für Testing
      confidence: 95,
      note: 'MOCK DATA - Activate AWS Textract for real OCR'
    })

  } catch (error) {
    console.error('OCR error:', error)
    return NextResponse.json(
      { error: 'Failed to extract text from image' },
      { status: 500 }
    )
  }
}
