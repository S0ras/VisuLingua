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
      console.error('AWS credentials not configured, using free translation API')
      
      // Use MyMemory Translation API as fallback (free, no API key needed)
      try {
        const encodedText = encodeURIComponent(text)
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLanguage}|${targetLanguage}`
        
        const response = await fetch(apiUrl)
        const data = await response.json()
        
        if (data.responseStatus === 200 && data.responseData.translatedText) {
          return NextResponse.json({
            originalText: text,
            translatedText: data.responseData.translatedText,
            sourceLanguage,
            targetLanguage,
            fallback: 'MyMemory API',
          })
        }
      } catch (fallbackError) {
        console.error('Fallback translation failed:', fallbackError)
      }
      
      // If fallback also fails, return the original text with a note
      return NextResponse.json({
        originalText: text,
        translatedText: text,
        sourceLanguage,
        targetLanguage,
        error: 'Translation unavailable - please configure AWS credentials',
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
