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
      { error: 'Failed to translate text' },
      { status: 500 }
    )
  }
}
