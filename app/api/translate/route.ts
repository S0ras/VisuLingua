import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate'
import { NextRequest, NextResponse } from 'next/server'

const translateClient = new TranslateClient({
  region: process.env.VISULINGUA_AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.VISULINGUA_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.VISULINGUA_AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLanguage = 'es', targetLanguage = 'de' } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    // Check if AWS credentials are configured
    if (!process.env.VISULINGUA_AWS_ACCESS_KEY_ID || !process.env.VISULINGUA_AWS_SECRET_ACCESS_KEY) {
      console.error('AWS credentials not configured, using mock translation')
      
      // Mock translation for development (simple dictionary lookup)
      const mockDictionary: { [key: string]: string } = {
        'hola': 'hallo',
        'casa': 'haus',
        'gato': 'katze',
        'perro': 'hund',
        'libro': 'buch',
        'mesa': 'tisch',
        'silla': 'stuhl',
        'agua': 'wasser',
        'comida': 'essen',
        'amor': 'liebe',
        'amigo': 'freund',
        'familia': 'familie',
        'trabajo': 'arbeit',
        'escuela': 'schule',
        'tiempo': 'zeit',
        'día': 'tag',
        'noche': 'nacht',
        'año': 'jahr',
        'mundo': 'welt',
        'vida': 'leben',
      }
      
      const lowerText = text.toLowerCase().trim()
      const mockTranslation = mockDictionary[lowerText] || `[${text}]`
      
      return NextResponse.json({
        originalText: text,
        translatedText: mockTranslation,
        sourceLanguage,
        targetLanguage,
        mock: true,
      })
    }

    const command = new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: sourceLanguage,
      TargetLanguageCode: targetLanguage,
    })

    const response = await translateClient.send(command)

    return NextResponse.json({
      originalText: text,
      translatedText: response.TranslatedText,
      sourceLanguage,
      targetLanguage,
    })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Failed to translate text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
