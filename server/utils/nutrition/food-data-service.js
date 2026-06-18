/**
 * Server-side food nutrition data service fetching from USDA FoodData Central
 * and falling back to Open Food Facts, and verifying meal macros using Nutritionix.
 */

async function getNutritionData(foodName) {
  // 1. Try USDA FoodData Central first
  const usdaApiKey = process.env.USDA_API_KEY;
  if (usdaApiKey && usdaApiKey !== 'your_free_key') {
    try {
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&api_key=${usdaApiKey}&pageSize=1`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.foods && data.foods.length > 0) {
          const food = data.foods[0];
          const nutrients = food.foodNutrients || [];

          const getNutrient = (nameQuery) => {
            const nut = nutrients.find(n => 
              n.nutrientName && 
              n.nutrientName.toLowerCase().includes(nameQuery.toLowerCase())
            );
            return nut ? Number(nut.value) : 0;
          };

          const calories = getNutrient('energy');
          const protein = getNutrient('protein');
          const carbs = getNutrient('carbohydrate');
          const fat = getNutrient('total lipid');

          return {
            name: foodName,
            caloriesPer100g: Math.round(calories),
            proteinPer100g: Number(protein.toFixed(1)),
            carbPer100g: Number(carbs.toFixed(1)),
            fatPer100g: Number(fat.toFixed(1)),
            source: 'usda'
          };
        }
      }
    } catch (err) {
      console.error(`USDA lookup error for ${foodName}:`, err.message);
    }
  }

  // 2. Fallback to Open Food Facts
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&json=true&page_size=1`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        const nutriments = product.nutriments || {};

        const calories = nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0;
        const protein = nutriments['proteins_100g'] || nutriments['proteins'] || 0;
        const carbs = nutriments['carbohydrates_100g'] || nutriments['carbohydrates'] || 0;
        const fat = nutriments['fat_100g'] || nutriments['fat'] || 0;

        return {
          name: foodName,
          caloriesPer100g: Math.round(Number(calories)),
          proteinPer100g: Number(Number(protein).toFixed(1)),
          carbPer100g: Number(Number(carbs).toFixed(1)),
          fatPer100g: Number(Number(fat).toFixed(1)),
          source: 'openfoodfacts'
        };
      }
    }
  } catch (err) {
    console.error(`Open Food Facts lookup error for ${foodName}:`, err.message);
  }

  // 3. Fallback to AI estimate placeholder if both fail
  return null;
}

async function verifyMealMacros(mealDescription) {
  const appId = process.env.NUTRITIONIX_APP_ID;
  const appKey = process.env.NUTRITIONIX_APP_KEY;

  if (!appId || !appKey || appId === 'your_app_id' || appKey === 'your_app_key') {
    console.log('[Nutritionix] API keys not configured. Skipping verification.');
    return { verified: false };
  }

  try {
    const res = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
      method: 'POST',
      headers: {
        'x-app-id': appId,
        'x-app-key': appKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mealDescription })
    });
    const data = await res.json();
    if (!data.foods || data.foods.length === 0) {
      return { verified: false };
    }
    const totals = data.foods.reduce((acc, food) => ({
      calories: acc.calories + (food.nf_calories || 0),
      protein:  acc.protein  + (food.nf_protein || 0),
      carbs:    acc.carbs    + (food.nf_total_carbohydrate || 0),
      fat:      acc.fat      + (food.nf_total_fat || 0),
      fiber:    acc.fiber    + (food.nf_dietary_fiber ?? 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
    return { ...totals, verified: true };
  } catch (err) {
    console.error('Nutritionix verification failed:', err.message);
    return { verified: false }; // Claude's own estimate used as fallback
  }
}

module.exports = {
  getNutritionData,
  verifyMealMacros
};
