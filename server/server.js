import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing from .env')
  process.exit(1)
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})
const DEMO_MODE = true

const demoRecipe = {
  recipeName: 'Tomato & Egg Fried Rice',
  description:
    'A quick, comforting and flavorful fried rice made with rice, tomatoes, onions and eggs.',

  servings: 2,

  ingredients: [
    {
      name: 'Cooked white rice',
      quantity: 2,
      unit: 'cups',
    },
    {
      name: 'Eggs',
      quantity: 2,
      unit: '',
    },
    {
      name: 'Medium tomatoes (chopped)',
      quantity: 2,
      unit: '',
    },
    {
      name: 'Onion (diced)',
      quantity: 1,
      unit: '',
    },
    {
      name: 'Cooking oil',
      quantity: 2,
      unit: 'tbsp',
    },
    {
      name: 'Salt',
      quantity: 0.5,
      unit: 'tsp',
    },
    {
      name: 'Black pepper',
      quantity: 0.25,
      unit: 'tsp',
    },
  ],

  steps: [
    'Heat the oil in a large pan over medium heat.',
    'Add the diced onion and sauté until soft and lightly golden.',
    'Add the chopped tomatoes and cook until they become soft and slightly saucy.',
    'Push the vegetables to one side and scramble the eggs in the same pan.',
    'Add the cooked rice, salt and black pepper, then stir-fry everything together for 3 to 4 minutes.',
    'Serve hot and enjoy your homemade tomato and egg fried rice!',
  ],

  swaps: [
    {
      ingredient: 'Cooking oil',
      alternatives: ['Butter', 'Ghee'],
    },
    {
      ingredient: 'Eggs',
      alternatives: ['Paneer', 'Tofu'],
    },
    {
      ingredient: 'Tomatoes',
      alternatives: ['Tomato puree', 'Bell pepper'],
    },
  ],
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Recipe backend is running',
  })
})

// Recipe endpoint
app.post('/api/recipe', async (req, res) => {
  console.log('🔥 Recipe request received')
  console.log('📦 Request body:', req.body)

  try {
    const { ingredients } = req.body

    if (!ingredients || !ingredients.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one ingredient.',
      })
    }

    console.log('📝 Creating recipe request...')

    const prompt = `
Create one practical recipe using these ingredients:

${ingredients}

Return ONLY valid JSON.
Do NOT use Markdown.
Do NOT use code fences.
Do NOT write anything before or after the JSON.

Use exactly this structure:

{
  "recipeName": "Recipe name",
  "description": "Short description",
  "servings": 2,
  "ingredients": [
    {
      "name": "Rice",
      "quantity": "1 cup"
    }
  ],
  "steps": [
    "First cooking step",
    "Second cooking step",
    "Third cooking step",
    "Fourth cooking step"
  ],
  "swaps": [
    {
      "ingredient": "Rice",
      "alternatives": [
        "Quinoa",
        "Noodles"
      ]
    }
  ]
}

Rules:
- Use the user's ingredients as much as possible.
- Keep the recipe realistic.
- Keep the description short.
- Give 4 to 6 cooking steps.
- Give useful substitutions.
- Keep the response concise.
`

   console.log('🤖 Recipe generation requested...')

if (DEMO_MODE) {
  console.log('🎬 DEMO MODE ACTIVE - using demo recipe')

  return res.json({
    success: true,
    recipe: demoRecipe,
  })
}

console.log('🤖 Sending structured request to Gemini...')

const interaction = await ai.interactions.create({
  model: 'gemini-3.6-flash',
  input: prompt,

  response_format: {
    type: 'text',
    mime_type: 'application/json',
    schema: recipeSchema,
  },
})

console.log('✅ Gemini responded')

const outputText = interaction.output_text

if (!outputText) {
  throw new Error('Gemini returned an empty response.')
}

console.log('📦 Gemini output received')

let recipe

try {
  recipe = JSON.parse(outputText)
} catch (parseError) {
  console.error('❌ Failed to parse Gemini response:')
  console.error(parseError)

  return res.status(500).json({
    success: false,
    error: 'Gemini returned an invalid recipe format.',
  })
}

    // Basic validation
    if (
      !recipe.recipeName ||
      !recipe.description ||
      !Number.isInteger(recipe.servings) ||
      !Array.isArray(recipe.ingredients) ||
      !Array.isArray(recipe.steps) ||
      !Array.isArray(recipe.swaps)
    ) {
      console.error('❌ Recipe validation failed:')
      console.error(recipe)

      return res.status(502).json({
        success: false,
        error: 'The AI returned an incomplete recipe. Please try again.',
      })
    }

    console.log('✅ Recipe validated successfully')

    return res.json({
      success: true,
      recipe,
    })

  } catch (error) {
    console.error('❌ Recipe generation error:')
    console.error(error)

    return res.status(500).json({
      success: false,
      error: error.message || 'Unable to generate the recipe right now.',
    })
  }
})

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`)
})