import { GoogleGenAI } from '@google/genai'
import 'dotenv/config'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

async function test() {
  console.log('🚀 Starting Gemini Interaction test...')

  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.6-flash',
      input: 'Give me a one sentence recipe using rice and tomatoes.'
    })

    console.log('✅ Gemini responded!')
    console.log('Status:', interaction.status)
    console.log('Output:', interaction.output_text)
  } catch (error) {
    console.error('❌ Gemini error:')
    console.error(error)
  }
}

test()