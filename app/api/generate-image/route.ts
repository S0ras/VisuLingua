import { 
  BedrockRuntimeClient, 
  InvokeModelCommand 
} from '@aws-sdk/client-bedrock-runtime'
import { NextRequest, NextResponse } from 'next/server'

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      )
    }

    // Using Stability AI SDXL 1.0
    const modelId = 'stability.stable-diffusion-xl-v1'
    
    const payload = {
      text_prompts: [
        {
          text: prompt,
          weight: 1,
        },
      ],
      cfg_scale: 7,
      steps: 30,
      seed: Math.floor(Math.random() * 1000000),
      width: 512,
      height: 512,
    }

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    })

    const response = await bedrockClient.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))

    // The response contains base64 encoded images
    const base64Image = responseBody.artifacts[0].base64

    return NextResponse.json({
      image: `data:image/png;base64,${base64Image}`,
      prompt,
    })
  } catch (error) {
    console.error('Bedrock error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
