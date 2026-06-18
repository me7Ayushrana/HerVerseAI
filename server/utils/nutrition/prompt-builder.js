/**
 * Prompts builder for generating the Claude diet plan.
 */

const SEASON_MAP = {
  winter: [12, 1, 2],    // Dec-Feb
  summer: [3, 4, 5, 6],  // Mar-Jun
  monsoon: [7, 8, 9],    // Jul-Sep
  autumn: [10, 11],      // Oct-Nov
};

const DIET_RULES = {
  vegetarian: `
    ABSOLUTE RULE — USER IS VEGETARIAN.
    BANNED: chicken, mutton, fish, salmon, tuna, prawns, eggs, beef, pork,
            any meat, any seafood, any poultry. Zero exceptions.
    ALLOWED: dal, paneer, curd, milk, ghee, all vegetables, all fruits,
             all grains, all lentils, nuts, seeds.`,

  vegan: `
    ABSOLUTE RULE — USER IS VEGAN.
    BANNED: all meat, all seafood, eggs, milk, paneer, curd, ghee, butter,
            honey, all animal products without exception.
    ALLOWED: all plant foods, tofu, plant oils, coconut milk, soy milk,
             all vegetables, fruits, grains, lentils, nuts, seeds.`,

  eggetarian: `
    ABSOLUTE RULE — USER IS EGGETARIAN.
    BANNED: chicken, mutton, fish, salmon, prawns, any meat, any seafood.
    ALLOWED: eggs in any form, dal, paneer, curd, milk, all vegetables,
             all grains, all lentils, nuts, seeds.`,

  jain: `
    ABSOLUTE RULE — USER IS JAIN.
    BANNED: all meat, seafood, eggs, root vegetables (potato, onion, garlic,
            carrot, radish, beetroot, turnip).
    ALLOWED: all above-ground vegetables, dairy, grains, lentils, fruits, nuts.`,

  omnivore: `
    USER EATS EVERYTHING. Still follow Indian food rules below.`
};

function computeMealSchedule(wakeTime, mealFrequency) {
  const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
  const wake = wakeHour * 60 + (wakeMin || 0);

  const schedules = {
    3: {
      breakfast:     formatTime(wake + 30),
      lunch:         formatTime(wake + 270),  // +4.5 hrs
      dinner:        formatTime(wake + 570),  // +9.5 hrs
    },
    4: {
      breakfast:     formatTime(wake + 30),
      lunch:         formatTime(wake + 240),
      evening_snack: formatTime(wake + 450),
      dinner:        formatTime(wake + 600),
    },
    5: {
      early_morning: formatTime(wake),
      breakfast:     formatTime(wake + 60),
      lunch:         formatTime(wake + 240),
      evening_snack: formatTime(wake + 420),
      dinner:        formatTime(wake + 570),
    },
    6: {
      early_morning: formatTime(wake),
      breakfast:     formatTime(wake + 90),
      mid_morning:   formatTime(wake + 180),
      lunch:         formatTime(wake + 270),
      evening_snack: formatTime(wake + 420),
      dinner:        formatTime(wake + 570),
    },
  };
  return schedules[mealFrequency] ?? schedules[5];
}

function formatTime(totalMinutes) {
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

function buildDietPrompt(params) {
  const {
    profile,
    cyclePhase,
    targetCalories,
    macros,
    cycleData,
    conditionOverrides,
    usdaFoodData
  } = params;

  // Format conditions protocols
  const healthProtocols = conditionOverrides && conditionOverrides.length > 0
    ? conditionOverrides.map(cond => `- ${cond.condition}: ${cond.note} | Prioritize: ${cond.prioritize.join(', ')} | Avoid: ${cond.avoid.join(', ')}`).join('\n')
    : "None active.";

  // Format pre-fetched food nutritional references
  const foodDataLines = usdaFoodData && Object.keys(usdaFoodData).length > 0
    ? Object.entries(usdaFoodData).map(([name, data]) => `- ${name}: ${data.caloriesPer100g}kcal, P:${data.proteinPer100g}g, C:${data.carbPer100g}g, F:${data.fatPer100g}g per 100g`).join('\n')
    : "None available.";

  // Extract profiles fields safely
  const age = profile.age || 25;
  const weightKg = profile.weightKg || 60;
  const heightCm = profile.heightCm || 160;
  const bmi = profile.bmi ? Number(profile.bmi).toFixed(1) : "N/A";
  const goal = profile.goal || "general_wellness";
  const activityLevel = profile.activityLevel || "moderately_active";
  const exerciseDaysPerWeek = profile.exerciseDaysPerWeek !== undefined ? profile.exerciseDaysPerWeek : 0;
  const exerciseTypes = profile.exerciseTypes && profile.exerciseTypes.length > 0 ? profile.exerciseTypes.join(', ') : "None";
  const dietType = profile.dietType || "omnivore";
  const cuisinePreferences = profile.cuisinePreferences && profile.cuisinePreferences.length > 0 ? profile.cuisinePreferences.join(', ') : "Indian";
  const cookingTime = profile.cookingTime || "moderate";
  const mealFrequency = profile.mealFrequency || 5;
  const wakeTime = profile.wakeTime || "07:00";
  const sleepTime = profile.sleepTime || "23:00";
  const allergies = profile.allergies && profile.allergies.length > 0 ? profile.allergies.join(', ') : "None";
  const intolerances = profile.intolerances && profile.intolerances.length > 0 ? profile.intolerances.join(', ') : "None";
  const avoidFoods = profile.avoidFoods && profile.avoidFoods.length > 0 ? profile.avoidFoods.join(', ') : "None";
  const preferredFoods = profile.preferredFoods && profile.preferredFoods.length > 0 ? profile.preferredFoods.join(', ') : "None";
  const healthConditions = profile.healthConditions && profile.healthConditions.length > 0 ? profile.healthConditions.join(', ') : "None";
  const stressLevel = profile.stressLevel || "moderate";
  const waterLiters = profile.waterLiters || 2.0;

  // Diet key resolution
  let dietKey = 'omnivore';
  if (dietType === 'veg' || dietType === 'vegetarian') {
    dietKey = 'vegetarian';
  } else if (dietType === 'non-veg') {
    dietKey = 'omnivore';
  } else if (DIET_RULES[dietType]) {
    dietKey = dietType;
  }
  const dietRuleText = DIET_RULES[dietKey] || DIET_RULES.omnivore;

  // Seasonal calculation
  const currentMonth = new Date().getMonth() + 1;
  const season = Object.entries(SEASON_MAP).find(([_, months]) =>
    months.includes(currentMonth))?.[0] ?? 'summer';

  // Schedule calculation
  const computedSchedule = computeMealSchedule(wakeTime, mealFrequency);

  // Extract supplements data safely
  const supplements = profile.supplements || { proteinPowder: null, others: [] };
  let supplementPromptInstruction = "";

  let targetCaloriesFood = targetCalories;
  let targetProteinG = macros.proteinG;
  let targetCarbG = macros.carbG;
  let targetFatG = macros.fatG;

  if (supplements.proteinPowder && supplements.proteinPowder.active === true) {
    const { name, proteinPer100g, carbsPer100g, fatPer100g, gramsPerDay, timing } = supplements.proteinPowder;
    
    // Calculate estimated macros of supplement scoop
    const ratio = (Number(gramsPerDay) || 30) / 100;
    const calcProtein = Number(((Number(proteinPer100g) || 0) * ratio).toFixed(1));
    const calcCarbs = Number(((Number(carbsPer100g) || 0) * ratio).toFixed(1));
    const calcFat = Number(((Number(fatPer100g) || 0) * ratio).toFixed(1));
    const calcCal = Math.round(calcProtein * 4 + calcCarbs * 4 + calcFat * 9);

    // Subtract supplement macros from target macros for the food items
    targetCaloriesFood = Math.max(0, Math.round(targetCalories - calcCal));
    targetProteinG = Math.max(0, Number((macros.proteinG - calcProtein).toFixed(1)));
    targetCarbG = Math.max(0, Number((macros.carbG - calcCarbs).toFixed(1)));
    targetFatG = Math.max(0, Number((macros.fatG - calcFat).toFixed(1)));

    supplementPromptInstruction = `
USER TAKES PROTEIN SUPPLEMENT:
Product: ${name}
Macros per 100g: P: ${proteinPer100g}g, C: ${carbsPer100g}g, F: ${fatPer100g}g
Daily intake: ${gramsPerDay}g taken at ${timing}

RULES:
1. Include this supplement as a line item in the ${timing} meal automatically
   e.g. { name: '${name} (protein supplement)', quantity: '${gramsPerDay}', unit: 'g',
          caloriesKcal: ${calcCal}, proteinG: ${calcProtein}, carbG: ${calcCarbs}, fatG: ${calcFat} }
2. Use the user-provided macros — do NOT guess supplement nutrition
3. Subtract the supplement's protein from the remaining food protein target for that day
   so the total daily protein target is still hit exactly, not exceeded
4. If user takes iron/B12/Vitamin D supplement, note it in the day's benefitNote
   as: 'Take your [supplement name] with this meal for best absorption'`;
  }

  if (supplements.others && supplements.others.length > 0) {
    const activeOthers = supplements.others.filter(s => s !== 'None');
    if (activeOthers.length > 0) {
      supplementPromptInstruction += `

USER TAKES OTHER SUPPLEMENTS: ${activeOthers.join(', ')}
RULES:
1. If user takes iron/B12/Vitamin D supplement, note it in the day's benefitNote
   as: 'Take your [supplement name] with this meal for best absorption'`;
    }
  }

  return `${dietRuleText}

MANDATORY INDIAN FOOD RULES:
- Every meal must be a real Indian dish with its proper Indian name
- All ingredients must be available at any standard Indian kirana store
- PERMANENTLY BANNED FOODS (never suggest these regardless of any other rule):
  salmon, tuna, avocado, blueberries, kale chips, granola bars, protein shakes,
  Greek yogurt, chia pudding, acai bowls, energy bars, almond milk, overnight oats
  with western toppings, quinoa salad, caesar salad, pasta, sandwich

- PREFERRED FOOD LIST — always choose from these families:
  Grains: roti, bajra roti, jowar roti, ragi roti, brown rice, poha, upma,
          daliya (broken wheat), khichdi, idli, dosa, paratha (without excess oil)
  Lentils: moong dal, masoor dal, toor dal, chana dal, rajma, chhole, moong sprouts,
           matki, urad dal, mixed dal
  Vegetables: palak, methi, lauki, tinda, tori, karela, bhindi, shimla mirch,
              gobhi, gajar, matar, beans, broccoli, tomato, cucumber, drumstick
  Dairy (if allowed): curd, paneer (low-fat if goal is weight_loss/metabolic_reset, full-fat if goal is weight_gain), buttermilk (chaach), whole milk (if goal is weight_gain) or skimmed milk (if goal is weight_loss/metabolic_reset),
                      raita, lassi (unsweetened)
  Fruits: banana, banana shake (with whole milk and nuts for weight_gain), papaya, guava, apple, pomegranate, amla, watermelon, mango
          (seasonal), chikoo, orange, mosambi
  Nuts & Seeds: soaked almonds, walnuts, pumpkin seeds, flaxseeds, til (sesame),
                peanuts, roasted chana
  Protein (non-veg only if dietType allows): eggs, chicken curry (home-style),
           egg bhurji, boiled eggs — NO western preparations
  Healthy fats: ghee (small quantity), coconut oil, mustard oil, cold-press oil
  Morning drinks: warm jeera water, methi water, amla juice, warm haldi milk,
                  ajwain water, green tea, black tea (no sugar or minimal)

${supplementPromptInstruction}

CRITICAL MEAL FORMAT RULE:
Do NOT suggest dish names like 'Paneer Tikka', 'Spinach Dal with Quinoa',
'Almond Berry Oats Bowl'. These are useless to the user.

Instead, list EXACT ingredients with EXACT quantities the user must consume.
The user does not need to cook a specific dish — she just needs to eat
the right amount of each food item.

WRONG FORMAT:
displayName: 'Paneer Tikka with Roti'
items: [{ name: 'Paneer Tikka', quantity: '1 serving' }]

CORRECT FORMAT:
displayName: 'Lunch'
items: [
  { name: 'Paneer (raw weight, any preparation)', quantity: '100', unit: 'g' },
  { name: 'Wheat Roti',                           quantity: '2',   unit: 'pieces' },
  { name: 'Palak / any green sabzi',              quantity: '150', unit: 'g' },
  { name: 'Curd',                                 quantity: '100', unit: 'g' },
]

Rules for items:
- Every food item has an exact gram or piece quantity
- Add '(any preparation)' after foods that can be cooked multiple ways
  e.g. 'Paneer (any preparation)', 'Eggs (any preparation)', 'Dal (any variety)'
- For vegetables write '(any green sabzi)' so user has flexibility
- displayName should be simple: 'Breakfast', 'Lunch', 'Dinner', 'Morning Snack'
  NOT a fancy recipe name
- benefitNote explains WHY these quantities, not what dish it is

You are Hervers' internal AI nutritionist — an expert in women's hormonal health, cycle-syncing nutrition, and Indian dietary patterns. You are generating a personalized 7-day meal plan inside the Hervers health platform.

USER PROFILE:
- Age: ${age} years
- Weight: ${weightKg} kg | Height: ${heightCm} cm | Base BMI: ${bmi}
- Goal: ${goal}
- Activity: ${activityLevel} (${exerciseDaysPerWeek} days/week, ${exerciseTypes})
- Diet type: ${dietType}
- Cuisine preferences: ${cuisinePreferences}
- Cooking time available: ${cookingTime}
- Meal frequency: ${mealFrequency} meals/day
- Wake time: ${wakeTime} | Sleep: ${sleepTime}
- Allergies: ${allergies}
- Intolerances: ${intolerances}
- Foods to avoid: ${avoidFoods}
- Preferred foods: ${preferredFoods}
- Health conditions: ${healthConditions}
- Stress level: ${stressLevel}
- Daily water target: ${waterLiters}L

CALORIE & MACRO TARGETS (calculated):
- Total daily calories: ${targetCaloriesFood} kcal
- Protein: ${targetProteinG}g | Carbs: ${targetCarbG}g | Fat: ${targetFatG}g

CURRENT MENSTRUAL CYCLE PHASE: ${cyclePhase} — ${cycleData.phaseName}
Phase insight: ${cycleData.phaseNote}
Priority nutrients this phase: ${cycleData.priorityNutrients.join(', ')}
Phase power foods to include: ${cycleData.powerFoods.join(', ')}
Foods to minimize this phase: ${cycleData.avoidList.join(', ')}
Calorie phase adjustment applied: +${cycleData.calorieAdjust} kcal

HEALTH CONDITION PROTOCOLS ACTIVE:
${healthProtocols}

VERIFIED NUTRITIONAL REFERENCE DATA (use these exact macros for these foods):
${foodDataLines}

DIET FRAMEWORK REFERENCES TO DRAW FROM:
- Cycle syncing nutrition (Alisa Vitti / FLO Living method)
- Anti-inflammatory Mediterranean principles
- Ayurvedic food wisdom for Indian women
- PCOS-specific nutrition research (D-chiro-inositol, low-GI, anti-inflammatory)
- DASH diet (blood pressure, hormonal balance)
- Precision nutrition for hormonal health (Dr. Aviva Romm protocol)

STRICT REQUIREMENTS:
1. All foods must be realistic, locally available in India
2. Estimated daily cost: ₹150–400 for all ingredients
3. Every meal must include a benefitNote explaining WHY this meal suits this user right now
4. Cooking instructions: maximum 4 steps, simple language
5. USE THESE EXACT MEAL TIMES — do not invent your own:
   ${JSON.stringify(computedSchedule)}
6. NEVER suggest foods the user is allergic to or intolerant of
7. Respect diet type strictly (${dietType}) — no exceptions
8. For active health conditions, apply the protocols above at every meal
9. Across all 7 days, no single dish should repeat more than TWICE.
   Rotis appear daily but must be paired with different sabzis each day.
   Dal variety: rotate between moong, masoor, toor, chana, rajma across the week.
   Breakfast variety: no same breakfast on consecutive days.
10. Current season in India: ${season}.
    Summer: prioritize cooling foods — curd, chaach, cucumber raita, watermelon, lauki, tinda. Avoid heavy fried food. Include nimbu pani.
    Winter: prioritize warming foods — til, bajra, gajar halwa (small portion), methi paratha, sarson saag, moong dal soup. Include haldi milk at night.
    Monsoon: prioritize immunity foods — tulsi, ginger, haldi, light khichdi. Avoid raw salads (contamination risk). Prefer cooked vegetables.
    Autumn: transition foods — mixed grains, light dals, seasonal fruits.

OUTPUT FORMAT — respond with ONLY this JSON, no markdown, no explanation:

{
  "planSummary": {
    "targetCalories": number,
    "proteinG": number,
    "carbG": number,
    "fatG": number,
    "cyclePhase": string,
    "keyFocusNote": string,
    "cycleBenefitNote": string
  },
  "days": [
    {
      "dayNumber": number,
      "dayLabel": string,
      "meals": [
        {
          "mealType": "early_morning" | "breakfast" | "mid_morning" | "lunch" | "evening_snack" | "dinner",
          "scheduledTime": string,
          "displayName": string,
          "items": [
            {
              "name": string,
              "quantity": string,
              "unit": string,
              "caloriesKcal": number,
              "proteinG": number,
              "carbG": number,
              "fatG": number
            }
          ],
          "totalCalories": number,
          "totalProtein": number,
          "totalCarb": number,
          "totalFat": number,
          "prepMinutes": number,
          "recipeSteps": string[],
          "benefitNote": string
        }
      ]
    }
  ]
}

Generate all 7 days. Each day must have ${mealFrequency} meals.
Vary the meals — no food should repeat more than twice in 7 days.
Make the plan exciting, culturally resonant, and deeply nourishing for this woman at this exact moment in her cycle.`;
}

module.exports = {
  buildDietPrompt
};
