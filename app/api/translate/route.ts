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
      console.error('AWS credentials not configured, using free translation API with enrichment')
      
      try {
        // Step 1: Get basic translation from MyMemory
        const encodedText = encodeURIComponent(text)
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLanguage}|${targetLanguage}`
        
        const myMemoryResponse = await fetch(myMemoryUrl)
        const myMemoryData = await myMemoryResponse.json()
        
        if (myMemoryData.responseStatus !== 200 || !myMemoryData.responseData.translatedText) {
          throw new Error('MyMemory translation failed')
        }
        
        let translation = myMemoryData.responseData.translatedText
        
        // Step 2: Try to enrich with LibreTranslate for multiple meanings
        try {
          const libreUrl = 'https://libretranslate.com/translate'
          const libreResponse = await fetch(libreUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: text,
              source: sourceLanguage,
              target: targetLanguage,
              format: 'text'
            })
          })
          
          if (libreResponse.ok) {
            const libreData = await libreResponse.json()
            // If LibreTranslate gives different result, add it as alternative
            if (libreData.translatedText && libreData.translatedText !== translation) {
              translation += ` | ${libreData.translatedText}`
            }
          }
        } catch (libreError) {
          console.log('LibreTranslate not available, using MyMemory only')
        }
        
        // Step 3: Detect word forms and add grammatical info
        const lowerText = text.toLowerCase().trim()
        let grammarInfo = ''
        let baseForm = ''
        
        // Spanish verb conjugations (common patterns)
        if (lowerText.endsWith('ando') || lowerText.endsWith('iendo')) {
          grammarInfo = '(Gerundio - laufende Handlung)'
          baseForm = lowerText.replace(/ando$/, 'ar').replace(/iendo$/, 'er/ir')
        } else if (lowerText.endsWith('ado') || lowerText.endsWith('ido')) {
          grammarInfo = '(Participio - Partizip Perfekt)'
          baseForm = lowerText.replace(/ado$/, 'ar').replace(/ido$/, 'er/ir')
        } else if (lowerText.endsWith('é') || lowerText.endsWith('í')) {
          grammarInfo = '(1. Person Sg. Präteritum)'
          baseForm = lowerText.replace(/é$/, 'ar').replace(/í$/, 'ir')
        } else if (lowerText.endsWith('aste') || lowerText.endsWith('iste')) {
          grammarInfo = '(2. Person Sg. Präteritum)'
          baseForm = lowerText.replace(/aste$/, 'ar').replace(/iste$/, 'ir')
        } else if (lowerText.endsWith('ó') || lowerText.endsWith('ió')) {
          grammarInfo = '(3. Person Sg. Präteritum)'
          baseForm = lowerText.replace(/ó$/, 'ar').replace(/ió$/, 'ir')
        } else if (lowerText.endsWith('amos') || lowerText.endsWith('imos')) {
          grammarInfo = '(1. Person Pl. Präsens/Präteritum)'
          baseForm = lowerText.replace(/amos$/, 'ar').replace(/imos$/, 'ir')
        } else if (lowerText.endsWith('áis') || lowerText.endsWith('éis') || lowerText.endsWith('ís')) {
          grammarInfo = '(2. Person Pl. Präsens)'
          baseForm = lowerText.replace(/áis$/, 'ar').replace(/éis$/, 'er').replace(/ís$/, 'ir')
        } else if (lowerText.endsWith('an') || lowerText.endsWith('en')) {
          grammarInfo = '(3. Person Pl. Präsens)'
          baseForm = lowerText.replace(/an$/, 'ar').replace(/en$/, 'er')
        } else if (lowerText.endsWith('as')) {
          grammarInfo = '(2. Person Sg. Präsens)'
          baseForm = lowerText.replace(/as$/, 'ar')
        } else if (lowerText.endsWith('a') && lowerText.length > 2) {
          grammarInfo = '(3. Person Sg. Präsens oder Imperativ)'
          baseForm = lowerText.replace(/a$/, 'ar')
        } else if (lowerText.endsWith('es')) {
          grammarInfo = '(2. Person Sg. Präsens)'
          baseForm = lowerText.replace(/es$/, 'er')
        } else if (lowerText.endsWith('e') && lowerText.length > 2 && !lowerText.endsWith('te')) {
          grammarInfo = '(3. Person Sg. Präsens oder Imperativ)'
          baseForm = lowerText.replace(/e$/, 'er')
        }
        
        // Spanish plural nouns
        else if (lowerText.endsWith('os') && !lowerText.endsWith('mos')) {
          grammarInfo = '(Plural maskulin)'
          baseForm = lowerText.replace(/os$/, 'o')
        } else if (lowerText.endsWith('as') && !lowerText.endsWith('tas') && lowerText.length > 3) {
          grammarInfo = '(Plural feminin)'
          baseForm = lowerText.replace(/as$/, 'a')
        } else if (lowerText.endsWith('es') && !lowerText.endsWith('tes') && lowerText.length > 3) {
          grammarInfo = '(Plural)'
          baseForm = lowerText.replace(/es$/, '')
        }
        
        // Build enriched translation
        let enrichedTranslation = translation
        if (grammarInfo && baseForm && baseForm !== lowerText) {
          enrichedTranslation = `${translation}\n\n${grammarInfo}\nGrundform: ${baseForm}`
        }
        
        return NextResponse.json({
          originalText: text,
          translatedText: enrichedTranslation,
          sourceLanguage,
          targetLanguage,
          fallback: 'MyMemory API + Grammar Analysis',
          grammarInfo: grammarInfo || undefined,
          baseForm: baseForm || undefined,
        })
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

    // Use AWS Translate
    const command = new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: sourceLanguage,
      TargetLanguageCode: targetLanguage,
    })

    const response = await translateClient.send(command)
    let translation = response.TranslatedText || text
    
    // Add grammar analysis also for AWS Translate
    const lowerText = text.toLowerCase().trim()
    let grammarInfo = ''
    let baseForm = ''
    
    // Spanish verb conjugations (common patterns)
    if (lowerText.endsWith('ando') || lowerText.endsWith('iendo')) {
      grammarInfo = '(Gerundio - laufende Handlung)'
      baseForm = lowerText.replace(/ando$/, 'ar').replace(/iendo$/, 'er/ir')
    } else if (lowerText.endsWith('ado') || lowerText.endsWith('ido')) {
      grammarInfo = '(Participio - Partizip Perfekt)'
      baseForm = lowerText.replace(/ado$/, 'ar').replace(/ido$/, 'er/ir')
    } else if (lowerText.endsWith('é') || lowerText.endsWith('í')) {
      grammarInfo = '(1. Person Sg. Präteritum)'
      baseForm = lowerText.replace(/é$/, 'ar').replace(/í$/, 'ir')
    } else if (lowerText.endsWith('aste') || lowerText.endsWith('iste')) {
      grammarInfo = '(2. Person Sg. Präteritum)'
      baseForm = lowerText.replace(/aste$/, 'ar').replace(/iste$/, 'ir')
    } else if (lowerText.endsWith('ó') || lowerText.endsWith('ió')) {
      grammarInfo = '(3. Person Sg. Präteritum)'
      baseForm = lowerText.replace(/ó$/, 'ar').replace(/ió$/, 'ir')
    } else if (lowerText.endsWith('amos') || lowerText.endsWith('imos')) {
      grammarInfo = '(1. Person Pl. Präsens/Präteritum)'
      baseForm = lowerText.replace(/amos$/, 'ar').replace(/imos$/, 'ir')
    } else if (lowerText.endsWith('áis') || lowerText.endsWith('éis') || lowerText.endsWith('ís')) {
      grammarInfo = '(2. Person Pl. Präsens)'
      baseForm = lowerText.replace(/áis$/, 'ar').replace(/éis$/, 'er').replace(/ís$/, 'ir')
    } else if (lowerText.endsWith('an') || lowerText.endsWith('en')) {
      grammarInfo = '(3. Person Pl. Präsens)'
      baseForm = lowerText.replace(/an$/, 'ar').replace(/en$/, 'er')
    } else if (lowerText.endsWith('as')) {
      grammarInfo = '(2. Person Sg. Präsens)'
      baseForm = lowerText.replace(/as$/, 'ar')
    } else if (lowerText.endsWith('a') && lowerText.length > 2) {
      grammarInfo = '(3. Person Sg. Präsens oder Imperativ)'
      baseForm = lowerText.replace(/a$/, 'ar')
    } else if (lowerText.endsWith('es')) {
      grammarInfo = '(2. Person Sg. Präsens)'
      baseForm = lowerText.replace(/es$/, 'er')
    } else if (lowerText.endsWith('e') && lowerText.length > 2 && !lowerText.endsWith('te')) {
      grammarInfo = '(3. Person Sg. Präsens oder Imperativ)'
      baseForm = lowerText.replace(/e$/, 'er')
    }
    // Spanish plural nouns
    else if (lowerText.endsWith('os') && !lowerText.endsWith('mos')) {
      grammarInfo = '(Plural maskulin)'
      baseForm = lowerText.replace(/os$/, 'o')
    } else if (lowerText.endsWith('as') && !lowerText.endsWith('tas') && lowerText.length > 3) {
      grammarInfo = '(Plural feminin)'
      baseForm = lowerText.replace(/as$/, 'a')
    } else if (lowerText.endsWith('es') && !lowerText.endsWith('tes') && lowerText.length > 3) {
      grammarInfo = '(Plural)'
      baseForm = lowerText.replace(/es$/, '')
    }
    
    // Build enriched translation
    let enrichedTranslation = translation
    if (grammarInfo && baseForm && baseForm !== lowerText) {
      enrichedTranslation = `${translation}\n\n${grammarInfo}\nGrundform: ${baseForm}`
    }

    return NextResponse.json({
      originalText: text,
      translatedText: enrichedTranslation,
      sourceLanguage,
      targetLanguage,
      grammarInfo: grammarInfo || undefined,
      baseForm: baseForm || undefined,
    })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Failed to translate text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
