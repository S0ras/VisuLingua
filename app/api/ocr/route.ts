import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract'
import { NextRequest, NextResponse } from 'next/server'

const textractClient = new TextractClient({
  region: process.env.VISULINGUA_AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.VISULINGUA_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.VISULINGUA_AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Convert base64 to Buffer
    const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64')

    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: imageBuffer,
      },
    })

    const response = await textractClient.send(command)
    
    // Extract text from blocks
    const lineBlocks = response.Blocks?.filter((block) => block.BlockType === 'LINE') || []
    
    const text = lineBlocks
      .map((block) => block.Text)
      .join(' ') || ''

    const confidence = lineBlocks.length > 0
      ? lineBlocks.reduce((sum, block) => sum + (block.Confidence || 0), 0) / lineBlocks.length
      : 0

    return NextResponse.json({
      text,
      confidence,
    })
  } catch (error) {
    console.error('Textract error:', error)
    return NextResponse.json(
      { error: 'Failed to extract text from image' },
      { status: 500 }
    )
  }
}
