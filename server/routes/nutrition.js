const express = require('express');
const router = express.Router();
const { Anthropic } = require('@anthropic-ai/sdk');

const { NutritionProfile, DietPlan } = require('../models/Nutrition');
const { calculateBMR, calculateTDEE, calculateTargetCalories } = require('../utils/nutrition/calorie-calculator');
const { calculateMacros } = require('../utils/nutrition/macro-calculator');
const { CYCLE_MAP } = require('../utils/nutrition/cycle-nutrition-map');
const { HEALTH_OVERRIDES } = require('../utils/nutrition/health-condition-overrides');
const { getNutritionData, verifyMealMacros } = require('../utils/nutrition/food-data-service');
const { buildDietPrompt } = require('../utils/nutrition/prompt-builder');

// Helper to calculate BMI
function getBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

// @route   POST /api/nutrition/save-profile
// @desc    Create or update nutrition profile for user
// @access  Public (proxied with userId)
router.post('/save-profile', async (req, res) => {
  try {
    const { userId, profileData } = req.body;
    if (!userId || !profileData) {
      return res.status(400).json({ message: 'Missing userId or profileData' });
    }

    const {
      age, weightKg, heightCm, goal, targetWeightKg, timelineWeeks,
      activityLevel, exerciseDaysPerWeek, exerciseTypes, dietType,
      cuisinePreferences, mealFrequency, cookingTime, allergies,
      intolerances, avoidFoods, preferredFoods, healthConditions,
      wakeTime, sleepTime, waterLiters, stressLevel, supplements
    } = profileData;

    const bmi = getBMI(Number(weightKg), Number(heightCm));

    let profile = await NutritionProfile.findOne({ userId });

    const fields = {
      userId,
      age: Number(age),
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      bmi,
      goal,
      targetWeightKg: targetWeightKg ? Number(targetWeightKg) : null,
      timelineWeeks: timelineWeeks ? Number(timelineWeeks) : null,
      activityLevel,
      exerciseDaysPerWeek: Number(exerciseDaysPerWeek) || 0,
      exerciseTypes: exerciseTypes || [],
      dietType,
      cuisinePreferences: cuisinePreferences || [],
      mealFrequency: Number(mealFrequency) || 5,
      cookingTime: cookingTime || 'moderate',
      allergies: allergies || [],
      intolerances: intolerances || [],
      avoidFoods: avoidFoods || [],
      preferredFoods: preferredFoods || [],
      healthConditions: healthConditions || [],
      wakeTime: wakeTime || '07:00',
      sleepTime: sleepTime || '23:00',
      waterLiters: Number(waterLiters) || 2.0,
      stressLevel: stressLevel || 'moderate',
      supplements: supplements || { proteinPowder: null, others: [] }
    };

    if (profile) {
      Object.assign(profile, fields);
      await profile.save();
    } else {
      profile = await NutritionProfile.create(fields);
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ message: "Something went wrong, let's try again 🌸", error: error.message });
  }
});

// @route   GET /api/nutrition/get-active-plan
// @desc    Retrieve active diet plan for user
// @access  Public
router.get('/get-active-plan', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId parameter' });
    }

    const plans = await DietPlan.find({ userId, isActive: true });
    // Proxy fallback check
    const activePlan = plans[0] || null;

    res.status(200).json({ success: true, plan: activePlan });
  } catch (error) {
    console.error('Error fetching active plan:', error);
    res.status(500).json({ message: "Something went wrong, let's try again 🌸", error: error.message });
  }
});

// MOCK PLAN GENERATOR FALLBACK
function generateMockPlan(profile, cyclePhase, targetCalories, macros, cycleData) {
  const days = [];
  const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Set default times based on wakeTime
  const wakeParts = (profile.wakeTime || "07:00").split(':');
  const wakeHour = parseInt(wakeParts[0]) || 7;
  const wakeMin = parseInt(wakeParts[1]) || 0;
  
  const addHours = (h) => {
    const totalMinutes = Math.round(h * 60);
    const totalWakeMinutes = wakeHour * 60 + wakeMin + totalMinutes;
    const finalHour = Math.floor((totalWakeMinutes % 1440) / 60);
    const finalMin = totalWakeMinutes % 60;
    const period = finalHour >= 12 ? "PM" : "AM";
    const displayH = finalHour > 12 ? finalHour - 12 : finalHour === 0 ? 12 : finalHour;
    const minsStr = finalMin < 10 ? `0${finalMin}` : finalMin;
    return `${displayH}:${minsStr} ${period}`;
  };

  const mealTimes = {
    early_morning: addHours(0),
    breakfast: addHours(1.5),
    mid_morning: addHours(4.5),
    lunch: addHours(6.5),
    evening_snack: addHours(10),
    dinner: addHours(13.5)
  };

  const isVeg = profile.dietType === 'veg' || profile.dietType === 'vegetarian' || profile.dietType === 'vegan' || profile.dietType === 'jain' || profile.dietType === 'eggitarian';

  // Base list of foods per cycle phase
  const cycleFoods = cycleData.powerFoods;

  // Extract supplements data safely
  const supplements = profile.supplements || { proteinPowder: null, others: [] };
  const hasProteinPowder = supplements.proteinPowder && supplements.proteinPowder.active === true;
  
  let targetMealType = 'breakfast';
  let calcProtein = 0;
  let calcCarbs = 0;
  let calcFat = 0;
  let calcCal = 0;
  let proteinPowderItem = null;

  if (hasProteinPowder) {
    const { name, proteinPer100g, carbsPer100g, fatPer100g, gramsPerDay, timing } = supplements.proteinPowder;
    const ratio = (Number(gramsPerDay) || 30) / 100;
    calcProtein = Number(((Number(proteinPer100g) || 0) * ratio).toFixed(1));
    calcCarbs = Number(((Number(carbsPer100g) || 0) * ratio).toFixed(1));
    calcFat = Number(((Number(fatPer100g) || 0) * ratio).toFixed(1));
    calcCal = Math.round(calcProtein * 4 + calcCarbs * 4 + calcFat * 9);

    proteinPowderItem = {
      name: `${name} (protein supplement)`,
      quantity: String(gramsPerDay),
      unit: 'g',
      caloriesKcal: calcCal,
      proteinG: calcProtein,
      carbG: calcCarbs,
      fatG: calcFat
    };

    const t = (timing || 'Morning').toLowerCase();
    if (t === 'morning') targetMealType = 'breakfast';
    else if (t === 'post-workout') targetMealType = 'lunch';
    else if (t === 'evening') targetMealType = 'evening_snack';
    else if (t === 'before bed') targetMealType = 'dinner';
  }

  const activeOthers = (supplements.others || []).filter(s => ['Iron tablets', 'B12', 'Vitamin D'].includes(s));
  const absorptionNote = activeOthers.length > 0
    ? ` Take your ${activeOthers.join(', ')} with this meal for best absorption.`
    : '';

  for (let i = 1; i <= 7; i++) {
    const meals = [];
    const frequency = profile.mealFrequency || 5;

    // Early Morning
    if (frequency >= 5) {
      const isEMTarget = targetMealType === 'early_morning';
      const items = [
        { name: "Ginger (any preparation)", quantity: "10", unit: "g", caloriesKcal: 5, proteinG: 0.1, carbG: 1.0, fatG: 0 },
        { name: "Lemon / citrus", quantity: "1", unit: "slice", caloriesKcal: 2, proteinG: 0, carbG: 0.5, fatG: 0 }
      ];
      if (isEMTarget && proteinPowderItem) {
        items.push(proteinPowderItem);
      }
      meals.push({
        id: `meal-mock-em-${i}`,
        mealType: 'early_morning',
        scheduledTime: mealTimes.early_morning,
        displayName: "Morning Drink",
        items,
        totalCalories: 7 + (isEMTarget ? calcCal : 0),
        totalProtein: Number((0.1 + (isEMTarget ? calcProtein : 0)).toFixed(1)),
        totalCarb: Number((1.5 + (isEMTarget ? calcCarbs : 0)).toFixed(1)),
        totalFat: 0 + (isEMTarget ? calcFat : 0),
        prepMinutes: 5,
        recipeSteps: ["Boil water in a pan", "Add crushed ginger and simmer for 3 minutes", "Strain into a cup and squeeze fresh lemon"],
        benefitNote: "Ginger eases gut digestion and reduces hormonal bloating." + (isEMTarget ? absorptionNote : ""),
        isRegenerated: false
      });
    }

    // Breakfast
    const isBFTarget = targetMealType === 'breakfast';
    const isWeightGain = profile.goal === 'weight_gain';
    const bfItems = [
      { name: i % 2 === 0 ? "Ragi flour (raw weight)" : "Rolled oats (raw weight)", quantity: "50", unit: "g", caloriesKcal: 180, proteinG: 5.5, carbG: 38, fatG: 1.5 },
      { 
        name: isWeightGain ? "Whole milk (or full-cream milk)" : "Almond milk (or low-fat milk)", 
        quantity: "200", 
        unit: "ml", 
        caloriesKcal: isWeightGain ? 130 : 60, 
        proteinG: isWeightGain ? 6.8 : 1.5, 
        carbG: isWeightGain ? 9.0 : 2.0, 
        fatG: isWeightGain ? 6.5 : 4.5 
      },
      { name: "Mixed seeds (pumpkin, flax, til)", quantity: "15", unit: "g", caloriesKcal: 85, proteinG: 3.0, carbG: 2.5, fatG: 7.0 }
    ];
    if (isBFTarget && proteinPowderItem) {
      bfItems.push(proteinPowderItem);
    }
    meals.push({
      id: `meal-mock-bf-${i}`,
      mealType: 'breakfast',
      scheduledTime: mealTimes.breakfast,
      displayName: "Breakfast",
      items: bfItems,
      totalCalories: 325 + (isBFTarget ? calcCal : 0),
      totalProtein: Number((10 + (isBFTarget ? calcProtein : 0)).toFixed(1)),
      totalCarb: Number((42.5 + (isBFTarget ? calcCarbs : 0)).toFixed(1)),
      totalFat: 13 + (isBFTarget ? calcFat : 0),
      prepMinutes: 10,
      recipeSteps: ["Heat milk in a pot", "Stir in grains and cook on low heat for 5 minutes", "Top with mixed seeds and serve warm"],
      benefitNote: `High in ${cycleData.priorityNutrients[0] || 'nutrients'} to support your body during the ${cycleData.phaseName}.` + (isBFTarget ? absorptionNote : ""),
      isRegenerated: false
    });

    // Mid Morning
    if (frequency >= 6) {
      const isMMTarget = targetMealType === 'mid_morning';
      const items = [
        { name: "Fresh coconut water", quantity: "1", unit: "glass", caloriesKcal: 45, proteinG: 1.0, carbG: 9.0, fatG: 0 },
        { name: "Almonds (soaked)", quantity: "5", unit: "pieces", caloriesKcal: 35, proteinG: 1.2, carbG: 1.0, fatG: 3.0 }
      ];
      if (isMMTarget && proteinPowderItem) {
        items.push(proteinPowderItem);
      }
      meals.push({
        id: `meal-mock-mm-${i}`,
        mealType: 'mid_morning',
        scheduledTime: mealTimes.mid_morning,
        displayName: "Morning Snack",
        items,
        totalCalories: 80 + (isMMTarget ? calcCal : 0),
        totalProtein: Number((2.2 + (isMMTarget ? calcProtein : 0)).toFixed(1)),
        totalCarb: Number((10.0 + (isMMTarget ? calcCarbs : 0)).toFixed(1)),
        totalFat: 3.0 + (isMMTarget ? calcFat : 0),
        prepMinutes: 2,
        recipeSteps: ["Pour fresh coconut water", "Serve alongside raw almonds"],
        benefitNote: "Replenishes trace minerals and electrolyte balance." + (isMMTarget ? absorptionNote : ""),
        isRegenerated: false
      });
    }

    // Lunch
    const isLHTarget = targetMealType === 'lunch';
    const lunchItems = isVeg ? [
      { name: "Yellow Moong Dal (raw weight, any variety)", quantity: "150", unit: "g", caloriesKcal: 160, proteinG: 11.0, carbG: 28.0, fatG: 1.0 },
      { name: "Cooked Quinoa (or brown rice)", quantity: "100", unit: "g", caloriesKcal: 120, proteinG: 4.4, carbG: 21.0, fatG: 2.0 },
      { name: "Palak / any green sabzi", quantity: "50", unit: "g", caloriesKcal: 12, proteinG: 1.2, carbG: 1.8, fatG: 0.1 }
    ] : [
      { name: "Salmon filet (raw weight, any preparation)", quantity: "120", unit: "g", caloriesKcal: 180, proteinG: 22.0, carbG: 0, fatG: 10.0 },
      { name: "Cooked Quinoa (or brown rice)", quantity: "100", unit: "g", caloriesKcal: 120, proteinG: 4.4, carbG: 21.0, fatG: 2.0 },
      { name: "Palak / any green sabzi", quantity: "50", unit: "g", caloriesKcal: 15, proteinG: 1.0, carbG: 2.0, fatG: 0 }
    ];
    if (isLHTarget && proteinPowderItem) {
      lunchItems.push(proteinPowderItem);
    }
    meals.push({
      id: `meal-mock-lh-${i}`,
      mealType: 'lunch',
      scheduledTime: mealTimes.lunch,
      displayName: "Lunch",
      items: lunchItems,
      totalCalories: (isVeg ? 292 : 315) + (isLHTarget ? calcCal : 0),
      totalProtein: Number(((isVeg ? 16.6 : 27.4) + (isLHTarget ? calcProtein : 0)).toFixed(1)),
      totalCarb: Number(((isVeg ? 50.8 : 23.0) + (isLHTarget ? calcCarbs : 0)).toFixed(1)),
      totalFat: (isVeg ? 3.1 : 12.0) + (isLHTarget ? calcFat : 0),
      prepMinutes: 20,
      recipeSteps: [
        isVeg ? "Wash and pressure cook dal with spinach" : "Season salmon with pinch of salt and lemon juice",
        isVeg ? "Boil quinoa with double volume water" : "Grill salmon for 4 minutes on each side",
        "Mix together and serve warm"
      ],
      benefitNote: `Contains ${cycleFoods[0] || 'nutrients'} providing complex carbs for stable blood sugar.` + (isLHTarget ? absorptionNote : ""),
      isRegenerated: false
    });

    // Evening Snack
    if (frequency >= 4) {
      const isESTarget = targetMealType === 'evening_snack';
      const items = isWeightGain ? [
        { name: "Banana (raw weight)", quantity: "150", unit: "g", caloriesKcal: 135, proteinG: 1.5, carbG: 34.0, fatG: 0.5 },
        { name: "Whole milk (or full-cream milk)", quantity: "250", unit: "ml", caloriesKcal: 160, proteinG: 8.5, carbG: 11.5, fatG: 8.5 },
        { name: "Mixed nuts & seeds (almonds, walnuts)", quantity: "20", unit: "g", caloriesKcal: 120, proteinG: 4.0, carbG: 4.0, fatG: 10.0 }
      ] : [
        { name: "Moong sprouts (raw weight)", quantity: "80", unit: "g", caloriesKcal: 90, proteinG: 6.0, carbG: 15.0, fatG: 0.5 },
        { name: "Cucumber & tomato (any green sabzi / salad)", quantity: "40", unit: "g", caloriesKcal: 10, proteinG: 0.4, carbG: 2.0, fatG: 0 }
      ];
      if (isESTarget && proteinPowderItem) {
        items.push(proteinPowderItem);
      }
      meals.push({
        id: `meal-mock-es-${i}`,
        mealType: 'evening_snack',
        scheduledTime: mealTimes.evening_snack,
        displayName: "Evening Snack",
        items,
        totalCalories: (isWeightGain ? 415 : 100) + (isESTarget ? calcCal : 0),
        totalProtein: Number(((isWeightGain ? 14.0 : 6.4) + (isESTarget ? calcProtein : 0)).toFixed(1)),
        totalCarb: Number(((isWeightGain ? 49.5 : 17.0) + (isESTarget ? calcCarbs : 0)).toFixed(1)),
        totalFat: (isWeightGain ? 19.0 : 0.5) + (isESTarget ? calcFat : 0),
        prepMinutes: 5,
        recipeSteps: isWeightGain 
          ? ["Add banana slices and whole milk to a blender", "Blend on high until smooth and creamy", "Pour into a glass and top with chopped mixed nuts"]
          : ["Toss sprouts with diced cucumber and tomato", "Season with lemon juice and a pinch of rock salt"],
        benefitNote: isWeightGain
          ? "High-calorie nutrient-dense banana shake to support healthy weight gain." + (isESTarget ? absorptionNote : "")
          : "High in fiber and plant enzymes to support healthy digestion." + (isESTarget ? absorptionNote : ""),
        isRegenerated: false
      });
    }

    // Dinner
    const isDNTarget = targetMealType === 'dinner';
    const dinnerItems = isVeg ? [
      { 
        name: isWeightGain ? "Paneer (full-fat, raw weight, any preparation)" : "Low-fat Paneer (raw weight, any preparation)", 
        quantity: "100", 
        unit: "g", 
        caloriesKcal: isWeightGain ? 265 : 180, 
        proteinG: isWeightGain ? 18.0 : 16.0, 
        carbG: isWeightGain ? 3.0 : 3.0, 
        fatG: isWeightGain ? 20.0 : 12.0 
      },
      { name: "Whole wheat roti", quantity: "2", unit: "pieces", caloriesKcal: 160, proteinG: 6.0, carbG: 30.0, fatG: 1.0 },
      { name: "Bell peppers & Onion (any green sabzi)", quantity: "50", unit: "g", caloriesKcal: 25, proteinG: 1.0, carbG: 5.0, fatG: 0.1 }
    ] : [
      { name: "Chicken breast (raw weight, any preparation)", quantity: "150", unit: "g", caloriesKcal: 165, proteinG: 31.0, carbG: 0, fatG: 3.6 },
      { name: "Brown rice", quantity: "100", unit: "g", caloriesKcal: 110, proteinG: 2.5, carbG: 23.0, fatG: 1.0 },
      { name: "Stir fried vegetables (any green sabzi)", quantity: "100", unit: "g", caloriesKcal: 45, proteinG: 2.0, carbG: 8.0, fatG: 1.0 }
    ];
    if (isDNTarget && proteinPowderItem) {
      dinnerItems.push(proteinPowderItem);
    }
    meals.push({
      id: `meal-mock-dn-${i}`,
      mealType: 'dinner',
      scheduledTime: mealTimes.dinner,
      displayName: "Dinner",
      items: dinnerItems,
      totalCalories: (isVeg ? 365 : 320) + (isDNTarget ? calcCal : 0),
      totalProtein: Number(((isVeg ? 23.0 : 35.5) + (isDNTarget ? calcProtein : 0)).toFixed(1)),
      totalCarb: Number(((isVeg ? 38.0 : 31.0) + (isDNTarget ? calcCarbs : 0)).toFixed(1)),
      totalFat: (isVeg ? 13.1 : 5.6) + (isDNTarget ? calcFat : 0),
      prepMinutes: 25,
      recipeSteps: [
        isVeg ? "Marinate paneer cubes and veggies" : "Preheat oven to 200C",
        isVeg ? "Grill on a non-stick pan for 8 minutes" : "Bake seasoned chicken for 20 minutes",
        "Serve hot with whole grain sides"
      ],
      benefitNote: "Lean protein promotes overnight cellular tissue repair." + (isDNTarget ? absorptionNote : ""),
      isRegenerated: false
    });

    days.push({
      dayNumber: i,
      dayLabel: dayLabels[i - 1],
      meals
    });
  }

  // Generate Plan Wrapper
  const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const weekLabel = `Week of ${new Date().toLocaleDateString('en-US', dateOptions)}`;

  return {
    userId: profile.userId,
    nutritionProfileId: profile.id || profile._id,
    cyclePhase,
    weekLabel,
    targetCalories,
    proteinG: macros.proteinG,
    carbG: macros.carbG,
    fatG: macros.fatG,
    keyFocusNote: `Focus on incorporating ${cycleData.priorityNutrients.slice(0, 3).join(', ')} to balance hormones.`,
    cycleBenefitNote: cycleData.phaseNote,
    days,
    isActive: true
  };
}


// @route   POST /api/nutrition/generate-plan
// @desc    Generate a complete 7-day plan using Gemini, Claude, or Mock fallback
// @access  Public (proxied with userId)
router.post('/generate-plan', async (req, res) => {
  try {
    const { userId, cyclePhase, clientApiKey } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId parameter' });
    }

    const activePhase = (cyclePhase || 'menstrual').toLowerCase();

    // 1. Fetch profile
    const profile = await NutritionProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: 'Nutrition profile not found. Please complete onboarding first.' });
    }

    // 2. Calculations
    const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    let targetCalories = calculateTargetCalories(tdee, profile.goal);

    // 3. Cycle Phase Adjustments
    const cycleData = CYCLE_MAP[activePhase] || CYCLE_MAP.menstrual;
    targetCalories += cycleData.calorieAdjust;

    const macros = calculateMacros(targetCalories, profile.goal, profile.healthConditions);

    // Set other active overrides
    const conditionOverrides = [];
    if (profile.healthConditions && profile.healthConditions.length > 0) {
      profile.healthConditions.forEach(cond => {
        if (HEALTH_OVERRIDES[cond]) {
          conditionOverrides.push({
            condition: cond,
            ...HEALTH_OVERRIDES[cond]
          });
        }
      });
    }

    // 4. Disable previous plans
    await DietPlan.updateMany({ userId, isActive: true }, { isActive: false });

    // 5. Check if Gemini API is active
    const geminiApiKey = clientApiKey || process.env.GEMINI_API_KEY;
    if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        console.log('[Gemini] Key detected. Fetching USDA food references in parallel...');
        
        // Fetch USDA references for common foods based on diet type
        const commonFoods = ['spinach', 'rolled oats', 'moong dal', 'greek yogurt', 'paneer', 'tofu', 'chickpeas', 'almonds'];
        const foodDataPromises = commonFoods.map(food => getNutritionData(food));
        const foodDataResults = await Promise.all(foodDataPromises);
        
        const usdaFoodData = {};
        foodDataResults.forEach((data, index) => {
          if (data) {
            usdaFoodData[commonFoods[index]] = data;
          }
        });

        const prompt = buildDietPrompt({
          profile,
          cyclePhase: activePhase,
          targetCalories,
          macros,
          cycleData,
          conditionOverrides,
          usdaFoodData
        });

        console.log('[Gemini] Sending prompt to Gemini API...');
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: { 
            responseMimeType: "application/json" 
          }
        });

        const result = await model.generateContent(prompt);
        const responseText = (await result.response).text();
        
        // Parse and sanitize JSON
        const cleanJSONText = responseText.substring(
          responseText.indexOf('{'),
          responseText.lastIndexOf('}') + 1
        );
        const parsedPlan = JSON.parse(cleanJSONText);

        const sanitizeMealTime = (raw) => {
          if (!raw || typeof raw !== 'string') return raw;
          return raw
            .replace(/(\d+)\.5:00/g, (_, h) => `${h}:30`)
            .replace(/(\d+)\.0:00/g, (_, h) => `${h}:00`)
            .replace(/(\d+)\.25:00/g, (_, h) => `${h}:15`)
            .replace(/(\d+)\.75:00/g, (_, h) => `${h}:45`);
        };

        if (parsedPlan.days && parsedPlan.days.length > 0) {
          for (const day of parsedPlan.days) {
            if (day.meals && day.meals.length > 0) {
              for (const meal of day.meals) {
                if (meal.scheduledTime) {
                  meal.scheduledTime = sanitizeMealTime(meal.scheduledTime);
                }
                if (meal.items && meal.items.length > 0) {
                  const queryStr = meal.items.map(item => `${item.quantity} ${item.unit || ''} ${item.name}`).join(' + ');
                  const verificationResult = await verifyMealMacros(queryStr);
                  if (verificationResult && verificationResult.verified) {
                    console.log(`[Nutritionix] Verified macros for meal: "${meal.displayName}"`);
                    meal.totalCalories = Math.round(verificationResult.calories);
                    meal.totalProtein = Number(verificationResult.protein.toFixed(1));
                    meal.totalCarb = Number(verificationResult.carbs.toFixed(1));
                    meal.totalFat = Number(verificationResult.fat.toFixed(1));
                  }
                }
              }
            }
          }
        }

        // Add additional required fields
        const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        const weekLabel = `Week of ${new Date().toLocaleDateString('en-US', dateOptions)}`;

        const newPlan = await DietPlan.create({
          userId,
          nutritionProfileId: profile.id || profile._id,
          cyclePhase: activePhase,
          weekLabel,
          targetCalories: parsedPlan.planSummary?.targetCalories || targetCalories,
          proteinG: parsedPlan.planSummary?.proteinG || macros.proteinG,
          carbG: parsedPlan.planSummary?.carbG || macros.carbG,
          fatG: parsedPlan.planSummary?.fatG || macros.fatG,
          keyFocusNote: parsedPlan.planSummary?.keyFocusNote || `Prioritize cycle-specific micro-nutrients.`,
          cycleBenefitNote: parsedPlan.planSummary?.cycleBenefitNote || cycleData.phaseNote,
          days: parsedPlan.days,
          isActive: true
        });

        console.log('[Gemini] Diet plan successfully generated and saved!');
        return res.status(200).json({ success: true, planId: newPlan.id || newPlan._id, plan: newPlan });

      } catch (geminiError) {
        console.error('[Gemini] Generation failed, falling back to Claude or mock:', geminiError);
      }
    }

    // 6. Check if Anthropic API is active (secondary fallback)
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && anthropicKey !== 'your_key') {
      try {
        console.log('[Claude] Key detected. Fetching USDA food references in parallel...');
        
        // Fetch USDA references for common foods based on diet type
        const commonFoods = ['spinach', 'rolled oats', 'moong dal', 'greek yogurt', 'paneer', 'tofu', 'chickpeas', 'almonds'];
        const foodDataPromises = commonFoods.map(food => getNutritionData(food));
        const foodDataResults = await Promise.all(foodDataPromises);
        
        const usdaFoodData = {};
        foodDataResults.forEach((data, index) => {
          if (data) {
            usdaFoodData[commonFoods[index]] = data;
          }
        });

        const prompt = buildDietPrompt({
          profile,
          cyclePhase: activePhase,
          targetCalories,
          macros,
          cycleData,
          conditionOverrides,
          usdaFoodData
        });

        console.log('[Claude] Sending prompt to Claude API...');
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        
        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8000,
          messages: [{ role: 'user', content: prompt }]
        });

        const contentText = message.content[0].text;
        // Parse and sanitize JSON
        const cleanJSONText = contentText.substring(
          contentText.indexOf('{'),
          contentText.lastIndexOf('}') + 1
        );
        const parsedPlan = JSON.parse(cleanJSONText);

        const sanitizeMealTime = (raw) => {
          if (!raw || typeof raw !== 'string') return raw;
          return raw
            .replace(/(\d+)\.5:00/g, (_, h) => `${h}:30`)
            .replace(/(\d+)\.0:00/g, (_, h) => `${h}:00`)
            .replace(/(\d+)\.25:00/g, (_, h) => `${h}:15`)
            .replace(/(\d+)\.75:00/g, (_, h) => `${h}:45`);
        };

        if (parsedPlan.days && parsedPlan.days.length > 0) {
          for (const day of parsedPlan.days) {
            if (day.meals && day.meals.length > 0) {
              for (const meal of day.meals) {
                if (meal.scheduledTime) {
                  meal.scheduledTime = sanitizeMealTime(meal.scheduledTime);
                }
                if (meal.items && meal.items.length > 0) {
                  const queryStr = meal.items.map(item => `${item.quantity} ${item.unit || ''} ${item.name}`).join(' + ');
                  const verificationResult = await verifyMealMacros(queryStr);
                  if (verificationResult && verificationResult.verified) {
                    console.log(`[Nutritionix] Verified macros for meal: "${meal.displayName}"`);
                    meal.totalCalories = Math.round(verificationResult.calories);
                    meal.totalProtein = Number(verificationResult.protein.toFixed(1));
                    meal.totalCarb = Number(verificationResult.carbs.toFixed(1));
                    meal.totalFat = Number(verificationResult.fat.toFixed(1));
                  }
                }
              }
            }
          }
        }

        // Add additional required fields
        const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        const weekLabel = `Week of ${new Date().toLocaleDateString('en-US', dateOptions)}`;

        const newPlan = await DietPlan.create({
          userId,
          nutritionProfileId: profile.id || profile._id,
          cyclePhase: activePhase,
          weekLabel,
          targetCalories: parsedPlan.planSummary.targetCalories || targetCalories,
          proteinG: parsedPlan.planSummary.proteinG || macros.proteinG,
          carbG: parsedPlan.planSummary.carbG || macros.carbG,
          fatG: parsedPlan.planSummary.fatG || macros.fatG,
          keyFocusNote: parsedPlan.planSummary.keyFocusNote || `Prioritize cycle-specific micro-nutrients.`,
          cycleBenefitNote: parsedPlan.planSummary.cycleBenefitNote || cycleData.phaseNote,
          days: parsedPlan.days,
          isActive: true
        });

        return res.status(200).json({ success: true, planId: newPlan.id || newPlan._id, plan: newPlan });

      } catch (claudeError) {
        console.error('[Claude] Generation failed, falling back to mock:', claudeError);
      }
    }

    // 7. Running Mock Generation Fallback
    console.log('[NutritionAPI] Running offline mock plan generator fallback...');
    const mockData = generateMockPlan(profile, activePhase, targetCalories, macros, cycleData);
    const newMockPlan = await DietPlan.create(mockData);

    res.status(200).json({ success: true, planId: newMockPlan.id || newMockPlan._id, plan: newMockPlan });
  } catch (error) {
    console.error('Error generating plan:', error);
    res.status(500).json({ message: "Something went wrong, let's try again 🌸", error: error.message });
  }
});

// @route   POST /api/nutrition/regenerate-meal
// @desc    Swap a single meal using Claude or Mock fallback
// @access  Public
router.post('/regenerate-meal', async (req, res) => {
  try {
    const { mealId, clientApiKey } = req.body;
    if (!mealId) {
      return res.status(400).json({ message: 'Missing mealId parameter' });
    }

    // 1. Find the active plan containing this meal
    const plans = await DietPlan.find({ isActive: true });
    
    let activePlan = null;
    let targetDay = null;
    let targetMeal = null;

    for (const plan of plans) {
      for (const day of plan.days) {
        const meal = day.meals.find(m => m.id === mealId || m._id === mealId || m._id?.toString() === mealId);
        if (meal) {
          activePlan = plan;
          targetDay = day;
          targetMeal = meal;
          break;
        }
      }
      if (activePlan) break;
    }

    if (!activePlan || !targetMeal) {
      return res.status(404).json({ message: 'Meal not found in active plan.' });
    }

    const profile = await NutritionProfile.findOne({ userId: activePlan.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Nutrition profile not found.' });
    }

    // 2. Check if Gemini is active
    const geminiApiKey = clientApiKey || process.env.GEMINI_API_KEY;
    if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        const allergies = profile.allergies && profile.allergies.length > 0 ? profile.allergies.join(', ') : "None";
        const avoidFoods = profile.avoidFoods && profile.avoidFoods.length > 0 ? profile.avoidFoods.join(', ') : "None";
        const healthConditions = profile.healthConditions && profile.healthConditions.length > 0 ? profile.healthConditions.join(', ') : "None";

        const prompt = `Suggest ONE alternative ${targetMeal.mealType} meal for a ${profile.goal} ${profile.dietType} woman in ${activePlan.cyclePhase} phase. 
        Calorie target: ${targetMeal.totalCalories}kcal.
        Must avoid allergies: ${allergies}. Foods to avoid: ${avoidFoods}.
        Health conditions to respect: ${healthConditions}.
        The current meal is "${targetMeal.displayName}" — suggest something completely different and culturally resonant for Indian diets.
        Return ONLY valid JSON matching this structure exactly, no extra text, no markdown:
        {
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
        }`;

        console.log('[Gemini] Requesting single meal regeneration...');
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: { 
            responseMimeType: "application/json" 
          }
        });
        
        const result = await model.generateContent(prompt);
        const responseText = (await result.response).text();
        const cleanJSONText = responseText.substring(
          responseText.indexOf('{'),
          responseText.lastIndexOf('}') + 1
        );
        const regeneratedData = JSON.parse(cleanJSONText);

        if (regeneratedData.items && regeneratedData.items.length > 0) {
          const queryStr = regeneratedData.items.map(item => `${item.quantity} ${item.unit || ''} ${item.name}`).join(' + ');
          const verificationResult = await verifyMealMacros(queryStr);
          if (verificationResult && verificationResult.verified) {
            console.log(`[Nutritionix] Verified swapped meal macros: "${regeneratedData.displayName}"`);
            regeneratedData.totalCalories = Math.round(verificationResult.calories);
            regeneratedData.totalProtein = Number(verificationResult.protein.toFixed(1));
            regeneratedData.totalCarb = Number(verificationResult.carbs.toFixed(1));
            regeneratedData.totalFat = Number(verificationResult.fat.toFixed(1));
          }
        }

        // Update the meal in the plan object
        const updatedDays = activePlan.days.map(day => {
          if (day.id === targetDay.id || day._id === targetDay._id) {
            const updatedMeals = day.meals.map(m => {
              if (m.id === mealId || m._id === mealId || m._id?.toString() === mealId) {
                return {
                  ...m,
                  ...regeneratedData,
                  id: mealId,
                  isRegenerated: true
                };
              }
              return m;
            });
            return { ...day, meals: updatedMeals };
          }
          return day;
        });

        activePlan.days = updatedDays;
        if (typeof activePlan.save === 'function') {
          await activePlan.save();
        } else {
          await DietPlan.updateMany({ _id: activePlan.id || activePlan._id }, activePlan);
        }

        const returnedMeal = {
          ...targetMeal.toObject ? targetMeal.toObject() : targetMeal,
          ...regeneratedData,
          isRegenerated: true
        };

        return res.status(200).json({ success: true, meal: returnedMeal });
      } catch (err) {
        console.error('[Gemini] Single meal swap failed, falling back to Claude or mock:', err);
      }
    }

    // 3. Check if Claude is active (secondary fallback)
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && anthropicKey !== 'your_key') {
      try {
        const allergies = profile.allergies && profile.allergies.length > 0 ? profile.allergies.join(', ') : "None";
        const avoidFoods = profile.avoidFoods && profile.avoidFoods.length > 0 ? profile.avoidFoods.join(', ') : "None";
        const healthConditions = profile.healthConditions && profile.healthConditions.length > 0 ? profile.healthConditions.join(', ') : "None";

        const prompt = `Suggest ONE alternative ${targetMeal.mealType} meal for a ${profile.goal} ${profile.dietType} woman in ${activePlan.cyclePhase} phase. 
        Calorie target: ${targetMeal.totalCalories}kcal.
        Must avoid allergies: ${allergies}. Foods to avoid: ${avoidFoods}.
        Health conditions to respect: ${healthConditions}.
        The current meal is "${targetMeal.displayName}" — suggest something completely different and culturally resonant for Indian diets.
        Return ONLY valid JSON matching this structure exactly, no extra text, no markdown:
        {
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
        }`;

        console.log('[Claude] Requesting single meal regeneration...');
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        
        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 800,
          messages: [{ role: 'user', content: prompt }]
        });

        const contentText = message.content[0].text;
        const cleanJSONText = contentText.substring(
          contentText.indexOf('{'),
          contentText.lastIndexOf('}') + 1
        );
        const regeneratedData = JSON.parse(cleanJSONText);

        if (regeneratedData.items && regeneratedData.items.length > 0) {
          const queryStr = regeneratedData.items.map(item => `${item.quantity} ${item.unit || ''} ${item.name}`).join(' + ');
          const verificationResult = await verifyMealMacros(queryStr);
          if (verificationResult && verificationResult.verified) {
            console.log(`[Nutritionix] Verified swapped meal macros: "${regeneratedData.displayName}"`);
            regeneratedData.totalCalories = Math.round(verificationResult.calories);
            regeneratedData.totalProtein = Number(verificationResult.protein.toFixed(1));
            regeneratedData.totalCarb = Number(verificationResult.carbs.toFixed(1));
            regeneratedData.totalFat = Number(verificationResult.fat.toFixed(1));
          }
        }

        // Update the meal in the plan object
        const updatedDays = activePlan.days.map(day => {
          if (day.id === targetDay.id || day._id === targetDay._id) {
            const updatedMeals = day.meals.map(m => {
              if (m.id === mealId || m._id === mealId || m._id?.toString() === mealId) {
                return {
                  ...m,
                  ...regeneratedData,
                  id: mealId,
                  isRegenerated: true
                };
              }
              return m;
            });
            return { ...day, meals: updatedMeals };
          }
          return day;
        });

        activePlan.days = updatedDays;
        if (typeof activePlan.save === 'function') {
          await activePlan.save();
        } else {
          await DietPlan.updateMany({ _id: activePlan.id || activePlan._id }, activePlan);
        }

        const returnedMeal = {
          ...targetMeal.toObject ? targetMeal.toObject() : targetMeal,
          ...regeneratedData,
          isRegenerated: true
        };

        return res.status(200).json({ success: true, meal: returnedMeal });
      } catch (err) {
        console.error('[Claude] Single meal swap failed, falling back to mock:', err);
      }
    }

    // 3. Fallback mock swap
    console.log('[NutritionAPI] Swapping meal using mock values...');
    const mockOptions = [
      {
        displayName: "High-Fiber Besan Chilla",
        items: [
          { name: "Besan flour", quantity: "60", unit: "g", caloriesKcal: 210, proteinG: 13.0, carbG: 34.0, fatG: 3.5 },
          { name: "Chopped tomatoes & spinach", quantity: "50", unit: "g", caloriesKcal: 15, proteinG: 0.8, carbG: 2.5, fatG: 0.1 }
        ],
        totalCalories: 225,
        totalProtein: 13.8,
        totalCarb: 36.5,
        totalFat: 3.6,
        prepMinutes: 12,
        recipeSteps: ["Whisk besan with water, rock salt, and spices", "Fold in chopped spinach and tomatoes", "Spread on a hot pan and cook with drop of ghee until golden"],
        benefitNote: "Fiber-rich and complex carbs support sustained energy release."
      },
      {
        displayName: "Moong Dal Sprouts Chaat",
        items: [
          { name: "Sprouted Moong Dal", quantity: "100", unit: "g", caloriesKcal: 120, proteinG: 8.0, carbG: 20.0, fatG: 0.5 },
          { name: "Pomegranate pearls", quantity: "30", unit: "g", caloriesKcal: 25, proteinG: 0.5, carbG: 5.5, fatG: 0.1 }
        ],
        totalCalories: 145,
        totalProtein: 8.5,
        totalCarb: 25.5,
        totalFat: 0.6,
        prepMinutes: 8,
        recipeSteps: ["Steam sprouts lightly for 3 minutes", "Mix with fresh pomegranate pearls and chopped herbs", "Drizzle fresh lime juice and serve"],
        benefitNote: "Pomegranate antioxidants support cellular recovery and egg vitality."
      }
    ];

    // Select different than current if possible
    const choice = mockOptions.find(o => o.displayName !== targetMeal.displayName) || mockOptions[0];

    const updatedDays = activePlan.days.map(day => {
      if (day.id === targetDay.id || day._id === targetDay._id) {
        const updatedMeals = day.meals.map(m => {
          if (m.id === mealId || m._id === mealId || m._id?.toString() === mealId) {
            return {
              ...m,
              ...choice,
              id: mealId,
              isRegenerated: true
            };
          }
          return m;
        });
        return { ...day, meals: updatedMeals };
      }
      return day;
    });

    activePlan.days = updatedDays;
    if (typeof activePlan.save === 'function') {
      await activePlan.save();
    } else {
      await DietPlan.updateMany({ _id: activePlan.id || activePlan._id }, activePlan);
    }

    const returnedMeal = {
      ...targetMeal.toObject ? targetMeal.toObject() : targetMeal,
      ...choice,
      isRegenerated: true
    };

    res.status(200).json({ success: true, meal: returnedMeal });
  } catch (error) {
    console.error('Error swapping meal:', error);
    res.status(500).json({ message: "Something went wrong, let's try again 🌸", error: error.message });
  }
});

module.exports = router;
