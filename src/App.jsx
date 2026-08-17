import { useState } from 'react'
import './App.css'

function getScaledQuantity(item, servings, originalServings) {
  const quantity = item.quantity

  if (
    typeof quantity === 'number' &&
    Number.isFinite(quantity) &&
    originalServings
  ) {
    const scaled = quantity * (servings / originalServings)

    return Number.isInteger(scaled)
      ? scaled
      : Number(scaled.toFixed(2))
  }

  if (typeof quantity === 'string') {
    const match = quantity.match(/^(\d+(?:\.\d+)?)(.*)$/)

    if (match && originalServings) {
      const number = Number(match[1])
      const rest = match[2]

      const scaled = number * (servings / originalServings)

      const formatted = Number.isInteger(scaled)
        ? scaled
        : Number(scaled.toFixed(2))

      return `${formatted}${rest}`
    }

    return quantity
  }

  return ''
}

function App() {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [servings, setServings] = useState(2)
  const [completedSteps, setCompletedSteps] = useState([])
  const [selectedSwaps, setSelectedSwaps] = useState({})
  const [otherIngredients, setOtherIngredients] = useState('')

  const [mealType, setMealType] = useState('Any')
  const [diet, setDiet] = useState('Any')
  const [cookingTime, setCookingTime] = useState('Any')
  const [favorite, setFavorite] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  const ingredientOptions = [
    { name: 'Rice', icon: '🍚' },
    { name: 'Tomatoes', icon: '🍅' },
    { name: 'Onions', icon: '🧅' },
    { name: 'Eggs', icon: '🥚' },
    { name: 'Potatoes', icon: '🥔' },
    { name: 'Carrots', icon: '🥕' },
    { name: 'Garlic', icon: '🧄' },
    { name: 'Chicken', icon: '🍗' },
    { name: 'Paneer', icon: '🧀' },
    { name: 'Cheese', icon: '🧀' },
    { name: 'Milk', icon: '🥛' },
    { name: 'Bread', icon: '🍞' },
    { name: 'Pasta', icon: '🍝' },
    { name: 'Noodles', icon: '🍜' },
    { name: 'Capsicum', icon: '🫑' },
    { name: 'Spinach', icon: '🥬' },
    { name: 'Corn', icon: '🌽' },
    { name: 'Beans', icon: '🫘' },
    { name: 'Mushrooms', icon: '🍄' },
    { name: 'Yogurt', icon: '🥣' },
  ]

  const mealOptions = [
    'Any',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snack',
  ]

  const dietOptions = [
    'Any',
    'Vegetarian',
    'Vegan',
    'High Protein',
    'Healthy',
  ]

  const timeOptions = [
    'Any',
    '15 min',
    '30 min',
    '45 min',
    '60+ min',
  ]

  const selectedIngredientList = ingredients
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const toggleIngredient = (name) => {
    const current = ingredients
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    const existingIndex = current.findIndex(
      (item) => item.toLowerCase() === name.toLowerCase()
    )

    if (existingIndex !== -1) {
      current.splice(existingIndex, 1)
    } else {
      current.push(name)
    }

    setIngredients(current.join(', '))
  }

  const selectAllIngredients = () => {
    setIngredients(
      ingredientOptions
        .map((ingredient) => ingredient.name)
        .join(', ')
    )
  }

  const clearAllIngredients = () => {
    setIngredients('')
    setOtherIngredients('')
  }

  const toggleStep = (index) => {
    setCompletedSteps((current) => {
      if (current.includes(index)) {
        return current.filter(
          (stepIndex) => stepIndex !== index
        )
      }

      return [...current, index]
    })
  }

  const selectSwap = (ingredient, alternative) => {
    setSelectedSwaps((current) => ({
      ...current,
      [ingredient]: alternative,
    }))
  }

  const handleGenerate = async () => {
    let finalIngredients = ingredients.trim()

    if (otherIngredients.trim()) {
      finalIngredients = finalIngredients
        ? `${finalIngredients}, ${otherIngredients.trim()}`
        : otherIngredients.trim()
    }

    if (!finalIngredients) {
      setError('Please select at least one ingredient.')
      return
    }

    setLoading(true)
    setError('')
    setRecipe(null)
    setFavorite(false)

    try {
      const response = await fetch(
        'http://localhost:5000/api/recipe',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ingredients: finalIngredients,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || 'Unable to generate recipe.'
        )
      }

      setRecipe(data.recipe)
      setServings(data.recipe.servings)
      setCompletedSteps([])
      setSelectedSwaps({})
    } catch (error) {
      console.error(error)

      setError(
        error.message ||
          'Something went wrong while generating the recipe.'
      )
    } finally {
      setLoading(false)
    }
  }

  const isIngredientAvailable = (ingredientName) => {
    const normalizedRecipeIngredient =
      ingredientName.toLowerCase()

    return selectedIngredientList.some((selected) => {
      const normalizedSelected = selected.toLowerCase()

      return (
        normalizedSelected.includes(normalizedRecipeIngredient) ||
        normalizedRecipeIngredient.includes(normalizedSelected)
      )
    })
  }

  const availableIngredients = recipe
    ? recipe.ingredients.filter((item) =>
        isIngredientAvailable(item.name)
      )
    : []

  const missingIngredients = recipe
    ? recipe.ingredients.filter(
        (item) => !isIngredientAvailable(item.name)
      )
    : []

  const matchPercentage =
    recipe && recipe.ingredients.length > 0
      ? Math.round(
          (availableIngredients.length /
            recipe.ingredients.length) *
            100
        )
      : 0

  return (
    <div className="app">

      {/* HEADER */}
      <header className="top-navbar">

  <div className="brand-area">

    <div className="brand-animation">

      <span className="brand-ingredient brand-tomato">
        🍅
      </span>

      <span className="brand-ingredient brand-carrot">
        🥕
      </span>

      <span className="brand-ingredient brand-egg">
        🥚
      </span>

      <div className="brand-pan">
        <span>🍚</span>
        <span>🥦</span>
      </div>

      <div className="brand-pan-handle"></div>

    </div>

    <div className="brand-text">

      <h1>Fridge to Recipe</h1>

      <p>
        Turn what you have into something delicious ✨
      </p>

    </div>

  </div>


  <nav className="main-navigation">

    <button
      type="button"
      className="nav-item nav-item-active"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
    >
      🏠 Find Recipes
    </button>


    <button
      type="button"
      className="nav-item"
      onClick={() =>
        document
          .querySelector('.input-card')
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
      }
    >
      🌿 My Ingredients
    </button>


    <div className="about-wrapper">

      <button
        type="button"
        className="nav-item about-button"
        onClick={() =>
          setAboutOpen((current) => !current)
        }
      >
        ⓘ About
        <span
          className={
            aboutOpen
              ? 'arrow arrow-open'
              : 'arrow'
          }
        >
          ▾
        </span>
      </button>


      {aboutOpen && (
        <div className="about-dropdown">

          <button
            type="button"
            className="about-dropdown-item"
            onClick={() => setAboutOpen(false)}
          >
            <span className="about-item-icon">
              🪄
            </span>

            <span>
              <strong>How It Works</strong>
              <small>
                See how your recipe is created
              </small>
            </span>
          </button>


          <button
            type="button"
            className="about-dropdown-item"
            onClick={() => setAboutOpen(false)}
          >
            <span className="about-item-icon">
              💡
            </span>

            <span>
              <strong>Tips & Ideas</strong>
              <small>
                Smart ways to use your ingredients
              </small>
            </span>
          </button>


          <button
            type="button"
            className="about-dropdown-item"
            onClick={() => setAboutOpen(false)}
          >
            <span className="about-item-icon">
              👩‍🍳
            </span>

            <span>
              <strong>About Us</strong>
              <small>
                Our story and mission
              </small>
            </span>
          </button>

        </div>
      )}

    </div>

  </nav>

</header>

      {/* MAIN */}
      <main className="main-content">

        <section className="input-card">

          {/* INTRO */}
          <div className="ingredient-heading-row">

            <div>

              <h2>
                🌿 What ingredients do you have?
              </h2>

              <p className="input-help">
                Select everything you have in your fridge
                or kitchen.
              </p>

            </div>

            <div className="ingredient-actions">

              <button
                type="button"
                onClick={selectAllIngredients}
              >
                ✨ Select all
              </button>

              <button
                type="button"
                onClick={clearAllIngredients}
              >
                🗑 Clear
              </button>

            </div>

          </div>

          {/* SELECTED COUNT */}
          <div className="selected-count">

            🧺{' '}

            {selectedIngredientList.length === 0
              ? 'No ingredients selected'
              : `${selectedIngredientList.length} ingredients selected`}

          </div>

          {/* PREFERENCES */}
          <div className="preferences">

            <div className="preference-section">

              <h3>
                🍽️ Meal Type
              </h3>

              <div className="option-grid">

                {mealOptions.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`option-chip ${
                      mealType === option
                        ? 'option-chip-active'
                        : ''
                    }`}
                    onClick={() =>
                      setMealType(option)
                    }
                  >
                    {option}
                  </button>
                ))}

              </div>

            </div>

            <div className="preference-section">

              <h3>
                🌱 Diet
              </h3>

              <div className="option-grid">

                {dietOptions.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`option-chip ${
                      diet === option
                        ? 'option-chip-active'
                        : ''
                    }`}
                    onClick={() =>
                      setDiet(option)
                    }
                  >
                    {option}
                  </button>
                ))}

              </div>

            </div>

            <div className="preference-section">

              <h3>
                ⏱️ Time
              </h3>

              <div className="option-grid">

                {timeOptions.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`option-chip ${
                      cookingTime === option
                        ? 'option-chip-active'
                        : ''
                    }`}
                    onClick={() =>
                      setCookingTime(option)
                    }
                  >
                    {option}
                  </button>
                ))}

              </div>

            </div>

          </div>

          {/* INGREDIENTS */}
          <div className="ingredients-title">

            <div>
              <h2>
                🧺 Your Ingredients
              </h2>

              <p>
                Pick what is available right now.
              </p>
            </div>

            <span>
              {selectedIngredientList.length === 0
                ? 'No ingredients selected'
                : `${selectedIngredientList.length} selected`}
            </span>

          </div>

          {/* 4 COLUMN GRID */}
          <div className="ingredient-checklist">

            {ingredientOptions.map((ingredient) => {

              const selected =
                selectedIngredientList.some(
                  (item) =>
                    item.toLowerCase() ===
                    ingredient.name.toLowerCase()
                )

              return (
                <label
                  key={ingredient.name}
                  className={`ingredient-check ${
                    selected
                      ? 'ingredient-check-selected'
                      : ''
                  }`}
                >

                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleIngredient(
                        ingredient.name
                      )
                    }
                  />

                  <span className="check-box">
                    {selected ? '✓' : ''}
                  </span>

                  <span className="ingredient-icon">
                    {ingredient.icon}
                  </span>

                  <span className="ingredient-name">
                    {ingredient.name}
                  </span>

                </label>
              )
            })}

          </div>

          {/* OTHER */}
          <div className="other-ingredients">

            <div className="other-title">

              <span className="other-plus">
                ＋
              </span>

              <div>
                <strong>
                  ✨ Other ingredients
                </strong>

                <p>
                  Have something that isn't listed above?
                </p>
              </div>

            </div>

            <input
              type="text"
              className="other-input"
              placeholder="Example: tofu, broccoli, leftover chicken..."
              value={otherIngredients}
              onChange={(event) =>
                setOtherIngredients(
                  event.target.value
                )
              }
            />

          </div>

          {/* GENERATE */}
          <button
            className="generate-button"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading
              ? '⏳ Creating your recipe...'
              : '✨ Generate Delicious Recipe'}
          </button>

        </section>

        {/* LOADING */}
        {loading && (
          <section className="empty-state loading-state">

            <div className="loading-spinner"></div>

            <h2>
              Creating your recipe...
            </h2>

            <p>
              Our AI chef is finding the tastiest way
              to use what you already have.
            </p>

            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>

          </section>
        )}

        {/* ERROR */}
        {error && !loading && (
          <section className="error-state">

            <div className="error-icon">
              ⚠️
            </div>

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

            <button
              className="retry-button"
              onClick={handleGenerate}
            >
              Try Again
            </button>

          </section>
        )}

        {/* EMPTY */}
        {!loading && !error && !recipe && (
          <section className="empty-state">

            <div className="empty-icon">
              🍳
            </div>

            <h2>
              Your recipe will appear here
            </h2>

            <p>
              Select your ingredients above and let AI
              create something delicious.
            </p>

          </section>
        )}

      </main>

      {/* =====================================================
          RECIPE MODAL
      ====================================================== */}

      {!loading && !error && recipe && (
        <div className="recipe-overlay">

          <div className="recipe-modal">

            {/* CLOSE */}
            <button
              type="button"
              className="recipe-close"
              onClick={() => setRecipe(null)}
              aria-label="Close recipe"
            >
              ×
            </button>

            {/* RECIPE HERO */}
            <div className="recipe-modal-header">

              <div className="recipe-image">

                <div className="recipe-food">
                  🍅
                </div>

                <span className="image-food image-food-one">
                  🧅
                </span>

                <span className="image-food image-food-two">
                  🥕
                </span>

                <span className="image-food image-food-three">
                  🌿
                </span>

              </div>

              <div className="recipe-introduction">

                <div className="recipe-title-row">

                  <span className="recipe-search-icon">
                    🔎
                  </span>

                  <h2>
                    {recipe.recipeName}
                  </h2>

                </div>

                <p className="recipe-description">
                  {recipe.description}
                </p>

                <div className="recipe-meta">

                  <span>
                    ⏱️ 20 minutes
                  </span>

                  <span>
                    🔥 Easy
                  </span>

                  <span>
                    👥 {servings} servings
                  </span>

                  <span className="match-badge">
                    {matchPercentage}% Match
                  </span>

                </div>

              </div>

            </div>

            {/* AVAILABLE / MISSING */}
            <div className="ingredient-status-grid">

              <div className="available-box">

                <h3>
                  🟢 Available ingredients
                </h3>

                {availableIngredients.length > 0 ? (
                  <ul>
                    {availableIngredients.map(
                      (item, index) => (
                        <li key={index}>
                          ✓ {item.name}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>
                    No direct ingredient matches.
                  </p>
                )}

              </div>

              <div className="missing-box">

                <h3>
                  🛒 Missing ingredients
                </h3>

                {missingIngredients.length > 0 ? (
                  <ul>
                    {missingIngredients.map(
                      (item, index) => (
                        <li key={index}>
                          • {item.name}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>
                    🎉 You have everything!
                  </p>
                )}

              </div>

            </div>

            {/* SERVINGS */}
            <div className="modal-servings">

              <span>
                👥 Servings
              </span>

              <div className="servings-controls">

                <button
                  type="button"
                  onClick={() =>
                    setServings((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  disabled={servings <= 1}
                >
                  −
                </button>

                <strong>
                  {servings}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setServings((current) =>
                      Math.min(12, current + 1)
                    )
                  }
                  disabled={servings >= 12}
                >
                  +
                </button>

              </div>

            </div>

            {/* INGREDIENT QUANTITIES */}
            <div className="modal-section">

              <h3>
                🥕 Ingredients & quantities
              </h3>

              <div className="modal-ingredient-grid">

                {recipe.ingredients.map(
                  (item, index) => {

                    const scaledQuantity =
                      getScaledQuantity(
                        item,
                        servings,
                        recipe.servings
                      )

                    const available =
                      isIngredientAvailable(
                        item.name
                      )

                    return (
                      <div
                        className={`modal-ingredient ${
                          available
                            ? 'modal-ingredient-available'
                            : ''
                        }`}
                        key={index}
                      >

                        <span>
                          {available
                            ? '✓'
                            : '•'}
                        </span>

                        <strong>
                          {item.name}
                        </strong>

                        <small>
                          {scaledQuantity}
                          {item.unit
                            ? ` ${item.unit}`
                            : ''}
                        </small>

                      </div>
                    )
                  }
                )}

              </div>

            </div>

            {/* STEPS */}
            <div className="modal-section">

              <div className="instructions-heading">

                <div>
                  <h3>
                    👩‍🍳 Instructions
                  </h3>

                  <p>
                    {completedSteps.length} of{' '}
                    {recipe.steps.length} completed
                  </p>
                </div>

                <span className="chef-decoration">
                  🍳
                </span>

              </div>

              <div className="modal-steps">

                {recipe.steps.map(
                  (step, index) => {

                    const completed =
                      completedSteps.includes(index)

                    return (
                      <button
                        type="button"
                        className={`modal-step ${
                          completed
                            ? 'modal-step-completed'
                            : ''
                        }`}
                        key={index}
                        onClick={() =>
                          toggleStep(index)
                        }
                      >

                        <span className="modal-step-number">
                          {completed
                            ? '✓'
                            : index + 1}
                        </span>

                        <span className="modal-step-text">
                          {step}
                        </span>

                      </button>
                    )
                  }
                )}

              </div>

            </div>

            {/* SWAPS */}
            {recipe.swaps.length > 0 && (
              <div className="modal-section">

                <h3>
                  🔄 Ingredient swaps
                </h3>

                <p className="swap-help">
                  Don't have an ingredient? Pick an
                  alternative.
                </p>

                <div className="swaps-list">

                  {recipe.swaps.map(
                    (swap, index) => {

                      const selected =
                        selectedSwaps[
                          swap.ingredient
                        ]

                      return (
                        <div
                          className="swap-item"
                          key={index}
                        >

                          <div className="swap-title">

                            <strong>
                              {swap.ingredient}
                            </strong>

                            {selected && (
                              <span className="selected-swap">
                                ✓ {selected}
                              </span>
                            )}

                          </div>

                          <div className="swap-options">

                            {swap.alternatives.map(
                              (
                                alternative,
                                alternativeIndex
                              ) => {

                                const isSelected =
                                  selected ===
                                  alternative

                                return (
                                  <button
                                    type="button"
                                    key={
                                      alternativeIndex
                                    }
                                    className={`swap-option ${
                                      isSelected
                                        ? 'swap-option-selected'
                                        : ''
                                    }`}
                                    onClick={() =>
                                      selectSwap(
                                        swap.ingredient,
                                        alternative
                                      )
                                    }
                                  >
                                    {isSelected
                                      ? '✓ '
                                      : ''}
                                    {alternative}
                                  </button>
                                )
                              }
                            )}

                          </div>

                        </div>
                      )
                    }
                  )}

                </div>

              </div>
            )}

            {/* ACTIONS */}
            <div className="recipe-actions">

              <button
                type="button"
                className={`favorite-button ${
                  favorite
                    ? 'favorite-active'
                    : ''
                }`}
                onClick={() =>
                  setFavorite((current) => !current)
                }
              >
                {favorite
                  ? '❤️ Saved to Favorites'
                  : '♡ Add to Favorites'}
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => setRecipe(null)}
              >
                ← Back to Recipes
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default App