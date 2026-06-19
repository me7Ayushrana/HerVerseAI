import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Droplet, Plus, RefreshCw, Trash2, Award, Sun, Moon, CalendarRange } from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import OnboardingShell from '../components/nutrition/onboarding/OnboardingShell';
import PlanHeader from '../components/nutrition/PlanHeader';
import WeekTabNav from '../components/nutrition/WeekTabNav';
import DayView from '../components/nutrition/DayView';
import MacroRing from '../components/nutrition/MacroRing';
import DownloadPlanButton from '../components/nutrition/DownloadPlanButton';
import LoadingOverlay from '../components/nutrition/LoadingOverlay';
import { getBestAvailableModelAndUrl } from '../utils/gemini';


// Calculation utilities for client-side fallback
const calculateBMR = (weight, height, age) => {
  return (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age)) - 161;
};

const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  };
  return bmr * (multipliers[activityLevel] || 1.2);
};

const calculateTargetCalories = (tdee, goal) => {
  if (goal === 'weight_loss') return tdee - 400;
  if (goal === 'weight_gain') return tdee + 400;
  return tdee;
};

const calculateMacros = (calories, goal, healthConditions = []) => {
  let carbPct = 0.45;
  let proteinPct = 0.25;
  let fatPct = 0.30;

  if (goal === 'weight_loss') {
    carbPct = 0.35;
    proteinPct = 0.35;
    fatPct = 0.30;
  } else if (goal === 'weight_gain') {
    carbPct = 0.50;
    proteinPct = 0.25;
    fatPct = 0.25;
  }

  if (healthConditions && healthConditions.includes('pcos')) {
    carbPct = 0.30;
    proteinPct = 0.30;
    fatPct = 0.40;
  }

  return {
    proteinG: Math.round((calories * proteinPct) / 4),
    carbG: Math.round((calories * carbPct) / 4),
    fatG: Math.round((calories * fatPct) / 9)
  };
};

const CYCLE_MAP = {
  menstrual: {
    phaseName: "Menstrual Phase",
    calorieAdjust: 100,
    priorityNutrients: ["iron", "magnesium", "omega-3", "vitamin C", "zinc", "B12"],
    avoidList: ["chai overload", "cold drinks", "refined maida", "alcohol", "excess salt"],
    powerFoods: ["spinach dal", "ragi roti", "pumpkin seeds", "dark chocolate", "banana", "ginger turmeric milk", "rajma", "sesame chikki", "pomegranate", "warm khichdi"],
    phaseNote: "Focus on warm, easily digestible foods that replenish iron and zinc lost during bleeding."
  },
  follicular: {
    phaseName: "Follicular Phase",
    calorieAdjust: 0,
    priorityNutrients: ["folate", "B12", "zinc", "probiotics", "fiber", "vitamin E"],
    avoidList: [],
    powerFoods: ["moong sprouts", "greek yogurt", "oats", "broccoli", "eggs", "almonds", "berries", "flaxseeds", "quinoa", "fermented rice kanji"],
    phaseNote: "Incorporate light, fresh foods and fiber to support developing follicles and metabolize rising estrogen."
  },
  ovulatory: {
    phaseName: "Ovulatory Phase",
    calorieAdjust: 150,
    priorityNutrients: ["antioxidants", "vitamin E", "glutathione", "fiber", "zinc"],
    avoidList: ["processed snacks", "excess sugar"],
    powerFoods: ["quinoa salad", "watermelon", "tomatoes", "asparagus", "figs", "coconut water", "sunflower seeds", "light poha", "raw carrot sticks", "amla"],
    phaseNote: "Energy is peaking! Focus on hydrating, cooling foods and antioxidants to support egg release."
  },
  luteal: {
    phaseName: "Luteal Phase",
    calorieAdjust: 200,
    priorityNutrients: ["magnesium", "B6", "calcium", "tryptophan", "complex carbs"],
    avoidList: ["caffeine", "alcohol", "excess salt", "refined sugar"],
    powerFoods: ["sweet potato", "brown rice", "chickpeas", "dates", "chamomile tea", "kale sabzi", "sunflower seeds", "dark chocolate", "banana oats smoothie", "turkey/paneer"],
    phaseNote: "Progesterone is rising. Prevent mood crashes, bloating, and sweet cravings with complex carbs, magnesium, and vitamin B6."
  }
};

const HEALTH_OVERRIDES = {
  pcos: {
    avoid: ["high-GI foods", "refined carbs", "excess dairy", "processed sugar"],
    prioritize: ["inositol-rich foods (buckwheat, citrus)", "anti-inflammatory omega-3", "chromium-rich foods (broccoli, green beans)", "magnesium", "low-GI carbs only"],
    note: "PCOS Protocol: Low-GI carbs only, anti-inflammatory focus, inositol-rich foods"
  },
  thyroid_hypo: {
    avoid: ["raw cruciferous vegetables (cauliflower, broccoli, cabbage — cook them instead)", "soy in excess", "gluten in excess"],
    prioritize: ["selenium (Brazil nuts, sunflower seeds)", "iodine (seaweed, iodized salt)", "zinc (pumpkin seeds, lentils)", "vitamin D (eggs, mushrooms)"],
    note: "Hypothyroid Protocol: Cook all cruciferous, selenium + iodine priority"
  },
  anemia: {
    avoid: ["tea/coffee with meals (blocks iron absorption)", "calcium with iron meals"],
    prioritize: ["iron-rich foods (spinach, rajma, ragi, dates)", "vitamin C with every meal", "B12 (eggs, paneer, fortified foods)"],
    note: "Anemia Protocol: Iron + Vitamin C pairings at every meal"
  },
  ibs: {
    avoid: ["high-FODMAP: onion, garlic raw, apple, excess wheat, lentils in excess", "carbonated drinks", "spicy food", "large meals"],
    prioritize: ["low-FODMAP: rice, oats, banana, carrot, cooked spinach, ginger", "probiotics (curd, kanji)", "small frequent meals"],
    note: "IBS Protocol: Low-FODMAP meals, no raw onion/garlic, small portions"
  },
  type2_diabetes: {
    avoid: ["high-GI: white rice excess, maida, sugary drinks, fruit juice", "large carb portions"],
    prioritize: ["low-GI carbs only: brown rice, oats, daliya", "fiber first (sabzi before roti)", "distribute carbs evenly across all meals", "bitter gourd, methi, cinnamon"],
    note: "Diabetes Protocol: Strict low-GI, fiber-first eating order, carbs distributed"
  },
  acne: {
    avoid: ["excess dairy", "high glycemic foods", "fried food", "refined sugar"],
    prioritize: ["zinc (pumpkin seeds, lentils)", "omega-3 (flaxseeds, walnuts)", "vitamin A (carrots, sweet potato)", "antioxidants", "adequate hydration"],
    note: "Skin Protocol: Anti-inflammatory, low-GI, zinc and omega-3 priority"
  }
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

function buildDietPromptClient({ profile, cyclePhase, targetCalories, macros, cycleData }) {
  const age = profile.age || 25;
  const weightKg = profile.weightKg || 60;
  const heightCm = profile.heightCm || 160;
  const bmi = (weightKg / ((heightCm/100) * (heightCm/100))).toFixed(1);
  const goal = profile.goal || "general_wellness";
  const activityLevel = profile.activityLevel || "moderately_active";
  const exerciseDaysPerWeek = profile.exerciseDaysPerWeek !== undefined ? profile.exerciseDaysPerWeek : 0;
  const exerciseTypes = profile.exerciseTypes && profile.exerciseTypes.length > 0 ? profile.exerciseTypes.join(', ') : "None";
  const dietType = profile.dietType || "veg";
  const mealFrequency = profile.mealFrequency || 5;
  const wakeTime = profile.wakeTime || "07:00";
  const sleepTime = profile.sleepTime || "23:00";
  const allergies = profile.allergies && profile.allergies.length > 0 ? profile.allergies.join(', ') : "None";
  const intolerances = profile.intolerances && profile.intolerances.length > 0 ? profile.intolerances.join(', ') : "None";
  const avoidFoods = profile.avoidFoods && profile.avoidFoods.length > 0 ? profile.avoidFoods.join(', ') : "None";
  const preferredFoods = profile.preferredFoods && profile.preferredFoods.length > 0 ? profile.preferredFoods.join(', ') : "None";
  const healthConditions = profile.healthConditions && profile.healthConditions.length > 0 ? profile.healthConditions.join(', ') : "None";
  const stressLevel = profile.stressLevel || "moderate";

  let dietKey = 'omnivore';
  if (dietType === 'veg' || dietType === 'vegetarian') dietKey = 'vegetarian';
  else if (dietType === 'non-veg') dietKey = 'omnivore';
  else if (DIET_RULES[dietType]) dietKey = dietType;
  const dietRuleText = DIET_RULES[dietKey] || DIET_RULES.omnivore;

  const conditionOverrides = [];
  if (profile.healthConditions) {
    profile.healthConditions.forEach(cond => {
      if (HEALTH_OVERRIDES[cond]) {
        conditionOverrides.push({ condition: cond, ...HEALTH_OVERRIDES[cond] });
      }
    });
  }
  const healthProtocols = conditionOverrides.length > 0
    ? conditionOverrides.map(cond => `- ${cond.condition}: ${cond.note} | Prioritize: ${cond.prioritize.join(', ')} | Avoid: ${cond.avoid.join(', ')}`).join('\n')
    : "None active.";

  const wakeParts = wakeTime.split(':');
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

  const computedSchedule = {};
  if (mealFrequency <= 3) {
    computedSchedule.breakfast = addHours(1.5);
    computedSchedule.lunch = addHours(5.5);
    computedSchedule.dinner = addHours(12);
  } else if (mealFrequency === 4) {
    computedSchedule.breakfast = addHours(1.5);
    computedSchedule.lunch = addHours(5.5);
    computedSchedule.evening_snack = addHours(9.5);
    computedSchedule.dinner = addHours(13);
  } else if (mealFrequency === 5) {
    computedSchedule.early_morning = addHours(0);
    computedSchedule.breakfast = addHours(1.5);
    computedSchedule.lunch = addHours(5.5);
    computedSchedule.evening_snack = addHours(9.5);
    computedSchedule.dinner = addHours(13);
  } else {
    computedSchedule.early_morning = addHours(0);
    computedSchedule.breakfast = addHours(1.5);
    computedSchedule.mid_morning = addHours(4);
    computedSchedule.lunch = addHours(6.5);
    computedSchedule.evening_snack = addHours(9.5);
    computedSchedule.dinner = addHours(13);
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
    Dairy (if allowed): curd, paneer (low-fat if goal is weight_loss, full-fat if goal is weight_gain), buttermilk (chaach), whole milk (if goal is weight_gain) or skimmed milk (if goal is weight_loss),
                        raita, lassi (unsweetened)
    Fruits: banana, banana shake (with whole milk and nuts for weight_gain), papaya, guava, apple, pomegranate, amla, watermelon, mango, chikoo, orange, mosambi
    Nuts & Seeds: soaked almonds, walnuts, pumpkin seeds, flaxseeds, til (sesame), peanuts, roasted chana
    Protein (non-veg only if dietType allows): eggs, chicken curry (home-style), egg bhurji, boiled eggs — NO western preparations
    Healthy fats: ghee (small quantity), coconut oil, mustard oil, cold-press oil
    Morning drinks: warm jeera water, methi water, amla juice, warm haldi milk, ajwain water, green tea, black tea
  
  CRITICAL MEAL FORMAT RULE:
  Do NOT suggest dish names like 'Paneer Tikka', 'Spinach Dal with Quinoa', 'Almond Berry Oats Bowl'. These are useless to the user.
  Instead, list EXACT ingredients with EXACT quantities the user must consume. The user does not need to cook a specific dish — she just needs to eat the right amount of each food item.
  
  CORRECT FORMAT:
  displayName: 'Lunch'
  items: [
    { name: 'Paneer (raw weight, any preparation)', quantity: '100', unit: 'g', caloriesKcal: 150, proteinG: 14, carbG: 3, fatG: 9 },
    { name: 'Wheat Roti',                           quantity: '2',   unit: 'pieces', caloriesKcal: 160, proteinG: 6, carbG: 30, fatG: 1 },
    { name: 'Palak / any green sabzi',              quantity: '150', unit: 'g', caloriesKcal: 20, proteinG: 1, carbG: 3, fatG: 0 },
    { name: 'Curd',                                 quantity: '100', unit: 'g', caloriesKcal: 60, proteinG: 3, carbG: 4, fatG: 2 }
  ]
  
  Rules for items:
  - Every food item has an exact gram or piece quantity
  - Add '(any preparation)' after foods that can be cooked multiple ways
  - For vegetables write '(any green sabzi)' so user has flexibility
  - displayName should be simple: 'Breakfast', 'Lunch', 'Dinner', 'Morning Snack'
  - benefitNote explains WHY these quantities, not what dish it is
  
  USER PROFILE:
  - Age: ${age} years
  - Weight: ${weightKg} kg | Height: ${heightCm} cm | Base BMI: ${bmi}
  - Goal: ${goal}
  - Activity: ${activityLevel} (${exerciseDaysPerWeek} days/week, ${exerciseTypes})
  - Diet type: ${dietType}
  - Meal frequency: ${mealFrequency} meals/day
  - Wake time: ${wakeTime} | Sleep: ${sleepTime}
  - Allergies: ${allergies}
  - Intolerances: ${intolerances}
  - Foods to avoid: ${avoidFoods}
  - Preferred foods: ${preferredFoods}
  - Health conditions: ${healthConditions}
  - Stress level: ${stressLevel}
  
  CALORIE & MACRO TARGETS (calculated):
  - Total daily calories: ${targetCalories} kcal
  - Protein: ${macros.proteinG}g | Carbs: ${macros.carbG}g | Fat: ${macros.fatG}g
  
  CURRENT MENSTRUAL CYCLE PHASE: ${cyclePhase} — ${cycleData.phaseName}
  Phase insight: ${cycleData.phaseNote}
  Priority nutrients this phase: ${cycleData.priorityNutrients.join(', ')}
  Phase power foods to include: ${cycleData.powerFoods.join(', ')}
  Phase calorie adjustment applied: +${cycleData.calorieAdjust} kcal
  
  HEALTH CONDITION PROTOCOLS ACTIVE:
  ${healthProtocols}
  
  STRICT REQUIREMENTS:
  1. All foods must be realistic, locally available in India
  2. Every meal must include a benefitNote explaining WHY this meal suits this user right now
  3. Cooking instructions / recipeSteps: maximum 4 steps, simple language
  4. USE THESE EXACT MEAL TIMES — do not invent your own:
     ${JSON.stringify(computedSchedule)}
  5. NEVER suggest foods the user is allergic to or intolerant of
  6. Respect diet type strictly (${dietType}) — no exceptions
  7. Across all 7 days, no single dish should repeat more than TWICE.
  
  OUTPUT FORMAT — respond with ONLY this JSON, no markdown code block formatting (DO NOT wrap in \`\`\`json ... \`\`\`), no explanation, just plain JSON string starting with { and ending with }:
  
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
  
  Generate all 7 days. Each day must have meals according to frequency (${mealFrequency} meals).
  Vary the meals — no food should repeat more than twice in 7 days.`;
}

const generateOfflineMealSwap = (mealType, currentDisplayName, isVeg, isWeightGain, targetCalories, macros, cycleData) => {
  const options = [];
  if (mealType === 'breakfast') {
    options.push(
      {
        displayName: "Vegetarian Oats & Almond Porridge",
        items: [
          { name: "Rolled oats (raw weight)", quantity: isWeightGain ? "60" : "40", unit: "g", caloriesKcal: isWeightGain ? 220 : 150, proteinG: isWeightGain ? 8 : 5, carbG: isWeightGain ? 40 : 26, fatG: 3 },
          { name: isVeg ? "Skimmed milk" : "Almond milk", quantity: "200", unit: "ml", caloriesKcal: isVeg ? 80 : 40, proteinG: isVeg ? 6 : 1, carbG: isVeg ? 10 : 2, fatG: isVeg ? 1 : 3 },
          { name: "Almonds & pumpkin seeds", quantity: "15", unit: "g", caloriesKcal: 90, proteinG: 3, carbG: 3, fatG: 8 }
        ],
        recipeSteps: ["Boil milk in a saucepan", "Add rolled oats and simmer for 5 minutes", "Top with almonds and seeds, serve warm."],
        benefitNote: "Slow-release carbohydrates and healthy fats to support hormones."
      },
      {
        displayName: "Savoury Besan Chilla with Mint Chutney",
        items: [
          { name: "Besan / Chickpea flour", quantity: isWeightGain ? "80" : "50", unit: "g", caloriesKcal: isWeightGain ? 290 : 180, proteinG: isWeightGain ? 16 : 10, carbG: isWeightGain ? 44 : 28, fatG: 4 },
          { name: "Chopped spinach & tomatoes", quantity: "100", unit: "g", caloriesKcal: 25, proteinG: 2, carbG: 4, fatG: 0 },
          { name: "Olive oil / Ghee (cooking)", quantity: "5", unit: "ml", caloriesKcal: 45, proteinG: 0, carbG: 0, fatG: 5 }
        ],
        recipeSteps: ["Whisk besan with water, spices, and chopped veggies to make a batter", "Heat a non-stick tawa and smear a few drops of ghee/oil", "Spread batter and cook both sides until golden brown."],
        benefitNote: "Iron and folate rich option."
      },
      {
        displayName: !isVeg ? "Egg Bhurji with Whole Wheat Toast" : "Paneer Bhurji with Whole Wheat Toast",
        items: [
          { name: !isVeg ? "Whole eggs" : "Paneer (low-fat)", quantity: !isVeg ? "2" : "80", unit: !isVeg ? "pieces" : "g", caloriesKcal: !isVeg ? 140 : 150, proteinG: !isVeg ? 12 : 14, carbG: !isVeg ? 1 : 2, fatG: !isVeg ? 10 : 9 },
          { name: "Whole wheat bread", quantity: isWeightGain ? "3" : "2", unit: "slices", caloriesKcal: isWeightGain ? 240 : 160, proteinG: isWeightGain ? 9 : 6, carbG: isWeightGain ? 45 : 30, fatG: 2 },
          { name: "Onions, tomatoes, capsicum", quantity: "100", unit: "g", caloriesKcal: 30, proteinG: 1, carbG: 6, fatG: 0 }
        ],
        recipeSteps: !isVeg 
          ? ["Beat eggs in a bowl with spices", "Sauté chopped onions and tomatoes, add beaten eggs", "Stir-fry until eggs are set and serve with toasted whole wheat bread."]
          : ["Crumble the fresh paneer", "Sauté chopped onions and vegetables in a pan", "Add crumbled paneer, spices and stir-fry for 3 minutes. Serve with toast."],
        benefitNote: "High quality proteins and essential fats."
      }
    );
  } else if (mealType === 'lunch') {
    options.push(
      {
        displayName: isVeg ? "Yellow Dal Khichdi with Vegetable Raita" : "Chicken & Rice Bowl with Vegetable Raita",
        items: isVeg ? [
          { name: "Yellow moong dal & brown rice mix (raw weight)", quantity: isWeightGain ? "90" : "60", unit: "g", caloriesKcal: isWeightGain ? 310 : 210, proteinG: isWeightGain ? 14 : 9, carbG: isWeightGain ? 62 : 42, fatG: 2 },
          { name: "Low-fat curd", quantity: "150", unit: "g", caloriesKcal: 90, proteinG: 6, carbG: 6, fatG: 4 }
        ] : [
          { name: "Chicken breast (raw weight, any preparation)", quantity: isWeightGain ? "150" : "100", unit: "g", caloriesKcal: isWeightGain ? 165 : 110, proteinG: isWeightGain ? 31 : 21, carbG: 0, fatG: 3 },
          { name: "Brown rice (raw weight)", quantity: "50", unit: "g", caloriesKcal: 175, proteinG: 3.5, carbG: 38, fatG: 1 },
          { name: "Low-fat curd", quantity: "100", unit: "g", caloriesKcal: 60, proteinG: 4, carbG: 4, fatG: 2 }
        ],
        recipeSteps: ["Cook grains and protein source together or separately", "Prepare a light vegetable raita on the side", "Combine and serve warm."],
        benefitNote: "High satiety option that supports energy balance."
      },
      {
        displayName: "High-Protein Chana Masala with Jeera Rice",
        items: [
          { name: "Kala chana / Chickpeas (boiled)", quantity: isWeightGain ? "150" : "100", unit: "g", caloriesKcal: isWeightGain ? 250 : 160, proteinG: isWeightGain ? 14 : 9, carbG: isWeightGain ? 40 : 27, fatG: 4 },
          { name: "Basmati rice / Brown rice (raw)", quantity: "50", unit: "g", caloriesKcal: 175, proteinG: 3.5, carbG: 38, fatG: 1 },
          { name: "Spinach / Palak puree", quantity: "100", unit: "g", caloriesKcal: 25, proteinG: 2, carbG: 3, fatG: 0 }
        ],
        recipeSteps: ["Sauté cumin seeds, ginger, and green chillies in 1 tsp oil", "Add chopped tomatoes, spinach puree, boiled chickpeas, and spices", "Simmer for 8 minutes and serve hot alongside cooked rice."],
        benefitNote: "Iron and vitamin C rich pairing."
      }
    );
  } else if (mealType === 'dinner') {
    options.push(
      {
        displayName: isVeg ? "Grilled Paneer & Veggies with Roti" : "Grilled Chicken Breast with Stir-Fry Veggies",
        items: isVeg ? [
          { name: "Paneer (low-fat)", quantity: isWeightGain ? "120" : "80", unit: "g", caloriesKcal: isWeightGain ? 220 : 150, proteinG: isWeightGain ? 20 : 14, carbG: 3, fatG: 14 },
          { name: "Wheat Roti", quantity: isWeightGain ? "2" : "1", unit: "pieces", caloriesKcal: isWeightGain ? 160 : 80, proteinG: isWeightGain ? 6 : 3, carbG: isWeightGain ? 30 : 15, fatG: 1 },
          { name: "Stir-fried capsicum, broccoli, mushrooms", quantity: "150", unit: "g", caloriesKcal: 45, proteinG: 3, carbG: 8, fatG: 0 }
        ] : [
          { name: "Chicken breast (raw weight, any preparation)", quantity: isWeightGain ? "150" : "100", unit: "g", caloriesKcal: isWeightGain ? 165 : 110, proteinG: isWeightGain ? 31 : 21, carbG: 0, fatG: 3 },
          { name: "Wheat Roti", quantity: isWeightGain ? "2" : "1", unit: "pieces", caloriesKcal: isWeightGain ? 160 : 80, proteinG: isWeightGain ? 6 : 3, carbG: isWeightGain ? 30 : 15, fatG: 1 },
          { name: "Stir-fried capsicum, broccoli, mushrooms", quantity: "150", unit: "g", caloriesKcal: 45, proteinG: 3, carbG: 8, fatG: 0 }
        ],
        recipeSteps: ["Sauté or grill protein and vegetables with 1 tsp olive oil", "Serve hot alongside toasted wheat roti."],
        benefitNote: "Rebuilds muscle tissue overnight."
      },
      {
        displayName: "Healthy Moong Dal Khichdi",
        items: [
          { name: "Moong dal & brown rice mix (raw weight)", quantity: isWeightGain ? "90" : "60", unit: "g", caloriesKcal: isWeightGain ? 310 : 210, proteinG: isWeightGain ? 14 : 9, carbG: isWeightGain ? 62 : 42, fatG: 2 },
          { name: "Sautéed Spinach / Palak", quantity: "100", unit: "g", caloriesKcal: 25, proteinG: 2, carbG: 3, fatG: 0 },
          { name: "Ghee", quantity: "5", unit: "ml", caloriesKcal: 45, proteinG: 0, carbG: 0, fatG: 5 }
        ],
        recipeSteps: ["Pressure cook dal, rice, spinach, and salt with 3 cups water", "Add a tadka of jeera and hing in ghee", "Serve hot and fresh."],
        benefitNote: "Gentle on the stomach for night digestion."
      }
    );
  } else {
    options.push(
      {
        displayName: "Mixed Nuts & Fruit Bowl",
        items: [
          { name: "Fresh seasonal fruits", quantity: "150", unit: "g", caloriesKcal: 80, proteinG: 1, carbG: 18, fatG: 0 },
          { name: "Almonds & Walnuts", quantity: "15", unit: "g", caloriesKcal: 90, proteinG: 3, carbG: 3, fatG: 8 }
        ],
        recipeSteps: ["Chop fresh seasonal fruits", "Mix with raw nuts and serve immediately."],
        benefitNote: "Quick vitamin and fat energy supply."
      }
    );
  }

  const filtered = options.filter(opt => opt.displayName.toLowerCase() !== currentDisplayName.toLowerCase());
  const selected = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : options[0];

  const totalCalories = selected.items.reduce((sum, item) => sum + item.caloriesKcal, 0);
  const totalProtein = selected.items.reduce((sum, item) => sum + item.proteinG, 0);
  const totalCarb = selected.items.reduce((sum, item) => sum + item.carbG, 0);
  const totalFat = selected.items.reduce((sum, item) => sum + item.fatG, 0);

  return {
    displayName: selected.displayName,
    items: selected.items,
    totalCalories: Math.round(totalCalories),
    totalProtein: Number(totalProtein.toFixed(1)),
    totalCarb: Number(totalCarb.toFixed(1)),
    totalFat: Number(totalFat.toFixed(1)),
    prepMinutes: selected.prepMinutes || 10,
    recipeSteps: selected.recipeSteps,
    benefitNote: selected.benefitNote
  };
};

const generateMealSwapWithDirectGemini = async (profile, cyclePhase, targetMeal, apiKey) => {
  const { getBestAvailableModelAndUrl } = await import('../utils/gemini');
  const { url } = await getBestAvailableModelAndUrl(apiKey);
  if (!url) throw new Error('Could not resolve Gemini API endpoint.');

  const allergies = profile.allergies && profile.allergies.length > 0 ? profile.allergies.join(', ') : "None";
  const avoidFoods = profile.avoidFoods && profile.avoidFoods.length > 0 ? profile.avoidFoods.join(', ') : "None";
  const healthConditions = profile.healthConditions && profile.healthConditions.length > 0 ? profile.healthConditions.join(', ') : "None";
  const dietType = profile.dietType || "veg";

  const prompt = `Suggest ONE alternative ${targetMeal.mealType} meal for a ${profile.goal || 'general'} ${dietType} woman in ${cyclePhase} phase. 
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

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini direct API error: Status ${response.status}`);
  }

  const resultData = await response.json();
  const candidate = resultData.candidates?.[0];
  const responseText = candidate?.content?.parts?.[0]?.text;
  if (!responseText) throw new Error('Empty response from Gemini.');

  const cleanJSONText = responseText.substring(
    responseText.indexOf('{'),
    responseText.lastIndexOf('}') + 1
  );
  return JSON.parse(cleanJSONText);
};

const generatePlanWithDirectGemini = async (profile, cyclePhase, targetCalories, macros, apiKey) => {
  const { getBestAvailableModelAndUrl } = await import('../utils/gemini');
  const { url } = await getBestAvailableModelAndUrl(apiKey);
  if (!url) throw new Error('Could not resolve Gemini API endpoint.');

  const phase = (cyclePhase || 'menstrual').toLowerCase();
  const cycleData = CYCLE_MAP[phase] || CYCLE_MAP.menstrual;

  const prompt = buildDietPromptClient({
    profile,
    cyclePhase,
    targetCalories,
    macros,
    cycleData
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini direct API error: Status ${response.status}`);
  }

  const resultData = await response.json();
  const candidate = resultData.candidates?.[0];
  const responseText = candidate?.content?.parts?.[0]?.text;
  if (!responseText) {
    throw new Error('Gemini returned an empty response.');
  }

  const cleanJSONText = responseText.substring(
    responseText.indexOf('{'),
    responseText.lastIndexOf('}') + 1
  );
  
  const parsedPlan = JSON.parse(cleanJSONText);

  const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const weekLabel = `Week of ${new Date().toLocaleDateString('en-US', dateOptions)}`;

  let dayNum = 1;
  const days = (parsedPlan.days || []).map(day => {
    let mealIndex = 1;
    const meals = (day.meals || []).map(meal => {
      return {
        id: `meal-direct-gemini-${dayNum}-${mealIndex++}`,
        ...meal,
        isRegenerated: false
      };
    });
    return {
      dayNumber: dayNum++,
      dayLabel: day.dayLabel || `Day ${dayNum - 1}`,
      meals
    };
  });

  return {
    userId: profile.userId || 'mock-user-123',
    nutritionProfileId: 'mock-profile-id',
    cyclePhase: phase,
    weekLabel,
    targetCalories: parsedPlan.planSummary?.targetCalories || targetCalories,
    proteinG: parsedPlan.planSummary?.proteinG || macros.proteinG,
    carbG: parsedPlan.planSummary?.carbG || macros.carbG,
    fatG: parsedPlan.planSummary?.fatG || macros.fatG,
    keyFocusNote: parsedPlan.planSummary?.keyFocusNote || `Prioritize cycle-specific micro-nutrients.`,
    cycleBenefitNote: parsedPlan.planSummary?.cycleBenefitNote || cycleData.phaseNote,
    days,
    isActive: true
  };
};

const generateClientMockPlan = (profile, cyclePhase, targetCalories, macros) => {
  const phase = (cyclePhase || 'menstrual').toLowerCase();
  const cycleData = CYCLE_MAP[phase] || CYCLE_MAP.menstrual;
  const days = [];
  const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
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

  const dietType = (profile.dietType || 'veg').toLowerCase();
  const isVeg = dietType === 'veg' || dietType === 'vegetarian' || dietType === 'vegan' || dietType === 'jain';
  const isVegan = dietType === 'vegan';
  const isWeightGain = profile.goal === 'weight_gain';

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
      name: `${name || 'Protein powder'} supplement`,
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

  const getBreakfastForDay = (dayNum) => {
    const options = [
      {
        displayName: "Vegetarian Oats & Almond Porridge",
        items: [
          { name: "Rolled oats (raw weight)", quantity: isWeightGain ? "60" : "40", unit: "g", caloriesKcal: isWeightGain ? 220 : 150, proteinG: isWeightGain ? 8 : 5, carbG: isWeightGain ? 40 : 26, fatG: 3 },
          { name: isVegan ? "Almond milk" : "Skimmed milk", quantity: "200", unit: "ml", caloriesKcal: isVegan ? 40 : 80, proteinG: isVegan ? 1 : 6, carbG: isVegan ? 2 : 10, fatG: isVegan ? 3 : 1 },
          { name: "Almonds & pumpkin seeds", quantity: "15", unit: "g", caloriesKcal: 90, proteinG: 3, carbG: 3, fatG: 8 }
        ],
        recipeSteps: ["Boil milk in a saucepan", "Add rolled oats and simmer for 5 minutes", "Top with almonds and seeds, serve warm."],
        benefitNote: `High in magnesium and slow-release carbohydrates to promote stable energy during your ${cycleData.phaseName}.`
      },
      {
        displayName: "Savoury Besan Chilla with Mint Chutney",
        items: [
          { name: "Besan / Chickpea flour", quantity: isWeightGain ? "80" : "50", unit: "g", caloriesKcal: isWeightGain ? 290 : 180, proteinG: isWeightGain ? 16 : 10, carbG: isWeightGain ? 44 : 28, fatG: 4 },
          { name: "Chopped spinach & tomatoes", quantity: "100", unit: "g", caloriesKcal: 25, proteinG: 2, carbG: 4, fatG: 0 },
          { name: "Olive oil / Ghee (cooking)", quantity: "5", unit: "ml", caloriesKcal: 45, proteinG: 0, carbG: 0, fatG: 5 }
        ],
        recipeSteps: ["Whisk besan with water, spices, and chopped veggies to make a batter", "Heat a non-stick tawa and smear a few drops of ghee/oil", "Spread batter and cook both sides until golden brown."],
        benefitNote: "Packed with iron, folate, and plant protein, supporting hormonal health and tissue repair."
      },
      {
        displayName: !isVeg ? "Egg Bhurji with Whole Wheat Toast" : "Paneer Bhurji with Whole Wheat Toast",
        items: [
          { name: !isVeg ? "Whole eggs" : "Paneer (low-fat)", quantity: !isVeg ? "2" : "80", unit: !isVeg ? "pieces" : "g", caloriesKcal: !isVeg ? 140 : 150, proteinG: !isVeg ? 12 : 14, carbG: !isVeg ? 1 : 2, fatG: !isVeg ? 10 : 9 },
          { name: "Whole wheat bread", quantity: isWeightGain ? "3" : "2", unit: "slices", caloriesKcal: isWeightGain ? 240 : 160, proteinG: isWeightGain ? 9 : 6, carbG: isWeightGain ? 45 : 30, fatG: 2 },
          { name: "Onions, tomatoes, capsicum", quantity: "100", unit: "g", caloriesKcal: 30, proteinG: 1, carbG: 6, fatG: 0 }
        ],
        recipeSteps: !isVeg 
          ? ["Beat eggs in a bowl with spices", "Sauté chopped onions and tomatoes, add beaten eggs", "Stir-fry until eggs are set and serve with toasted whole wheat bread."]
          : ["Crumble the fresh paneer", "Sauté chopped onions and vegetables in a pan", "Add crumbled paneer, spices and stir-fry for 3 minutes. Serve with toast."],
        benefitNote: "High-quality protein and essential healthy fats to kickstart daily metabolic activity."
      },
      {
        displayName: "Vegetable Poha with Roasted Peanuts",
        items: [
          { name: "Flattened rice / Poha", quantity: isWeightGain ? "80" : "50", unit: "g", caloriesKcal: isWeightGain ? 280 : 180, proteinG: isWeightGain ? 5 : 3, carbG: isWeightGain ? 60 : 38, fatG: 1 },
          { name: "Peanuts (roasted)", quantity: "15", unit: "g", caloriesKcal: 85, proteinG: 4, carbG: 3, fatG: 7 },
          { name: "Carrot, green peas, curry leaves", quantity: "100", unit: "g", caloriesKcal: 40, proteinG: 2, carbG: 8, fatG: 0 }
        ],
        recipeSteps: ["Rinse poha under running water and drain", "Sauté mustard seeds, curry leaves, and veggies in 1 tsp oil", "Add poha, turmeric, salt and peanuts, steam covered for 2 minutes."],
        benefitNote: "Light and easy on the gut, featuring mineral-rich vegetables aligned with cycle wellness."
      },
      {
        displayName: "Ragi Dosa with Coconut Chutney",
        items: [
          { name: "Ragi dosa batter", quantity: isWeightGain ? "150" : "100", unit: "ml", caloriesKcal: isWeightGain ? 240 : 160, proteinG: isWeightGain ? 6 : 4, carbG: isWeightGain ? 48 : 32, fatG: 2 },
          { name: "Fresh grated coconut chutney", quantity: "30", unit: "g", caloriesKcal: 80, proteinG: 1, carbG: 3, fatG: 7 },
          { name: "Sesame oil (cooking)", quantity: "5", unit: "ml", caloriesKcal: 45, proteinG: 0, carbG: 0, fatG: 5 }
        ],
        recipeSteps: ["Pour a ladle of batter onto a hot tawa and spread circularly", "Drizzle a few drops of sesame oil and cook until crisp", "Fold and serve hot with fresh coconut chutney."],
        benefitNote: "Excellent calcium and iron supply, critical for follicular and menstrual phase restoration."
      },
      {
        displayName: "Mixed Sprouted Moong Salad",
        items: [
          { name: "Sprouted Moong (raw weight)", quantity: isWeightGain ? "100" : "70", unit: "g", caloriesKcal: isWeightGain ? 100 : 70, proteinG: isWeightGain ? 7 : 5, carbG: isWeightGain ? 18 : 12, fatG: 0.5 },
          { name: "Cucumber, tomato, pomegranate seeds", quantity: "120", unit: "g", caloriesKcal: 50, proteinG: 1.5, carbG: 10, fatG: 0 },
          { name: "Soaked walnuts (chopped)", quantity: "10", unit: "g", caloriesKcal: 65, proteinG: 1.5, carbG: 1.5, fatG: 6 }
        ],
        recipeSteps: ["Steam sprouted moong for 3 minutes to improve digestibility", "Mix with chopped cucumber, tomato, and pomegranate", "Squeeze fresh lemon juice, sprinkle rock salt, and top with walnuts."],
        benefitNote: "Raw/steamed plant enzymes and active folate to optimize estrogen metabolism."
      },
      {
        displayName: "Banana & Seed Smoothie Bowl",
        items: [
          { name: "Banana", quantity: "1", unit: "medium", caloriesKcal: 105, proteinG: 1.3, carbG: 27, fatG: 0.3 },
          { name: isVegan ? "Soy milk" : "Curd / Yogurt", quantity: "150", unit: "g", caloriesKcal: 80, proteinG: 6, carbG: 6, fatG: 3 },
          { name: "Flaxseeds & chia seeds", quantity: "15", unit: "g", caloriesKcal: 80, proteinG: 3, carbG: 4, fatG: 6 }
        ],
        recipeSteps: ["Blend banana and curd/soy milk until smooth", "Pour into a bowl", "Top with flaxseeds, chia seeds, and a pinch of cinnamon."],
        benefitNote: "B-vitamins and healthy fats to ease uterine contractions and calm progesterone fluctuations."
      }
    ];
    return options[(dayNum - 1) % options.length];
  };

  const getLunchForDay = (dayNum) => {
    const options = [
      {
        displayName: isVeg ? "Yellow Dal Khichdi with Vegetable Raita" : "Chicken & Rice Bowl with Vegetable Raita",
        items: isVeg ? [
          { name: "Yellow moong dal & brown rice mix (raw weight)", quantity: isWeightGain ? "90" : "60", unit: "g", caloriesKcal: isWeightGain ? 310 : 210, proteinG: isWeightGain ? 14 : 9, carbG: isWeightGain ? 62 : 42, fatG: 2 },
          { name: isVegan ? "Coconut Yogurt" : "Low-fat curd", quantity: "150", unit: "g", caloriesKcal: 90, proteinG: isVegan ? 2 : 6, carbG: 6, fatG: 4 },
          { name: "Ghee / Oil", quantity: "5", unit: "ml", caloriesKcal: 45, proteinG: 0, carbG: 0, fatG: 5 }
        ] : [
          { name: "Chicken breast (raw weight, any preparation)", quantity: isWeightGain ? "150" : "100", unit: "g", caloriesKcal: isWeightGain ? 165 : 110, proteinG: isWeightGain ? 31 : 21, carbG: 0, fatG: 3 },
          { name: "Brown rice (raw weight)", quantity: "50", unit: "g", caloriesKcal: 175, proteinG: 3.5, carbG: 38, fatG: 1 },
          { name: "Low-fat curd (for raita)", quantity: "100", unit: "g", caloriesKcal: 60, proteinG: 4, carbG: 4, fatG: 2 }
        ],
        recipeSteps: isVeg 
          ? ["Pressure cook dal, rice, turmeric, and salt with 3x water", "Whisk curd with grated cucumber and cumin powder for raita", "Serve khichdi hot with a teaspoon of warm ghee and raita."]
          : ["Boil brown rice", "Grill or sauté seasoned chicken breast with a splash of olive oil", "Serve together with cucumber-onion raita on the side."],
        benefitNote: "A soothing, easy-to-digest combination that stabilizes gut microbiota and prevents insulin spikes."
      },
      {
        displayName: isVeg ? "Paneer Curry with Bajra Roti" : "Egg Curry with Bajra Roti",
        items: isVeg ? [
          { name: isVegan ? "Organic Tofu (firm)" : "Paneer (low-fat)", quantity: isWeightGain ? "120" : "80", unit: "g", caloriesKcal: isWeightGain ? 220 : 150, proteinG: isWeightGain ? 20 : 14, carbG: 3, fatG: 14 },
          { name: "Bajra flour / Pearl millet", quantity: "60", unit: "g", caloriesKcal: 215, proteinG: 7, carbG: 45, fatG: 3 },
          { name: "Tomato & Onion gravy bases", quantity: "120", unit: "g", caloriesKcal: 40, proteinG: 1, carbG: 8, fatG: 0 }
        ] : [
          { name: "Whole eggs", quantity: "2", unit: "pieces", caloriesKcal: 140, proteinG: 12, carbG: 1, fatG: 10 },
          { name: "Bajra flour / Pearl millet", quantity: "60", unit: "g", caloriesKcal: 215, proteinG: 7, carbG: 45, fatG: 3 },
          { name: "Tomato & Onion gravy bases", quantity: "120", unit: "g", caloriesKcal: 40, proteinG: 1, carbG: 8, fatG: 0 }
        ],
        recipeSteps: ["Knead bajra flour with warm water and roll into rotis", "Sauté onion, ginger-garlic paste, tomato puree, and spices", "Add protein source (paneer/tofu/boiled eggs) and simmer for 5 minutes. Serve with roti."],
        benefitNote: "Millet carbs coupled with structured protein to sustain muscle fuel and maintain ovulation cycles."
      },
      {
        displayName: "High-Protein Chana Masala with Jeera Rice",
        items: [
          { name: "Kala chana / Chickpeas (boiled)", quantity: isWeightGain ? "150" : "100", unit: "g", caloriesKcal: isWeightGain ? 250 : 160, proteinG: isWeightGain ? 14 : 9, carbG: isWeightGain ? 40 : 27, fatG: 4 },
          { name: "Basmati rice / Brown rice (raw)", quantity: "50", unit: "g", caloriesKcal: 175, proteinG: 3.5, carbG: 38, fatG: 1 },
          { name: "Spinach / Palak puree", quantity: "100", unit: "g", caloriesKcal: 25, proteinG: 2, carbG: 3, fatG: 0 }
        ],
        recipeSteps: ["Sauté cumin seeds, ginger, and green chillies in 1 tsp oil", "Add chopped tomatoes, spinach puree, boiled chickpeas, and spices", "Simmer for 8 minutes and serve hot alongside cooked rice."],
        benefitNote: "Excellent source of non-heme iron and vitamin C to fuel blood cell production."
      },
      {
        displayName: isVeg ? "Lentil Soup with Tofu Stir-Fry" : "Grilled Fish Fillet with Steamed Veggies",
        items: isVeg ? [
          { name: "Toor dal / Yellow split pea (raw)", quantity: "40", unit: "g", caloriesKcal: 140, proteinG: 9, carbG: 24, fatG: 1 },
          { name: "Organic Tofu (firm)", quantity: isWeightGain ? "120" : "80", unit: "g", caloriesKcal: isWeightGain ? 100 : 70, proteinG: isWeightGain ? 12 : 8, carbG: 2, fatG: 4 },
          { name: "Broccoli, beans, baby corn", quantity: "150", unit: "g", caloriesKcal: 50, proteinG: 3, carbG: 10, fatG: 0 }
        ] : [
          { name: "Fish / Rohu or Surmai fillet (raw)", quantity: isWeightGain ? "150" : "100", unit: "g", caloriesKcal: isWeightGain ? 180 : 120, proteinG: isWeightGain ? 28 : 19, carbG: 0, fatG: 7 },
          { name: "Steamed green beans & carrots", quantity: "150", unit: "g", caloriesKcal: 45, proteinG: 2, carbG: 9, fatG: 0 },
          { name: "Olive oil", quantity: "5", unit: "ml", caloriesKcal: 45, proteinG: 0, carbG: 0, fatG: 5 }
        ],
        recipeSteps: isVeg
          ? ["Pressure cook toor dal with garlic and tomatoes", "Stir-fry tofu cubes and broccoli in a pan with soy sauce and spices", "Serve warm soup alongside the tofu veggie stir-fry."]
          : ["Season the fish fillet with black pepper, salt, and lemon", "Pan-sear in 1 tsp olive oil for 3 minutes on each side", "Serve alongside steamed carrots and green beans."],
        benefitNote: "Rich in thyroid-supporting selenium and zinc to optimize biological pathways."
      },
      {
        displayName: "Rajma Masala with Brown Rice",
        items: [
          { name: "Red Kidney beans / Rajma (boiled)", quantity: isWeightGain ? "150" : "100", unit: "g", caloriesKcal: isWeightGain ? 200 : 130, proteinG: isWeightGain ? 12 : 8, carbG: isWeightGain ? 36 : 24, fatG: 1 },
          { name: "Brown rice (raw weight)", quantity: "50", unit: "g", caloriesKcal: 175, proteinG: 3.5, carbG: 38, fatG: 1 },
          { name: "Cucumber raita (dairy/coconut base)", quantity: "100", unit: "g", caloriesKcal: 60, proteinG: 3, carbG: 4, fatG: 2 }
        ],
        recipeSteps: ["Sauté onions, ginger, garlic, and tomato paste", "Add boiled kidney beans and their broth with rajma spices", "Simmer until thick and serve with cooked brown rice and raita."],
        benefitNote: "Soluble fiber and zinc to stabilize estrogen/progesterone ratios in the luteal phase."
      },
      {
        displayName: isVeg ? "Masoor Dal with Roti & Gajar Sabzi" : "Home-style Chicken Curry with Roti",
        items: isVeg ? [
          { name: "Whole red lentils / Sabut Masoor (raw)", quantity: "50", unit: "g", caloriesKcal: 170, proteinG: 12, carbG: 30, fatG: 1 },
          { name: "Wheat Roti", quantity: isWeightGain ? "3" : "2", unit: "pieces", caloriesKcal: isWeightGain ? 240 : 160, proteinG: isWeightGain ? 9 : 6, carbG: isWeightGain ? 45 : 30, fatG: 2 },
          { name: "Sautéed carrot & green peas sabzi", quantity: "100", unit: "g", caloriesKcal: 50, proteinG: 2, carbG: 10, fatG: 0 }
        ] : [
          { name: "Chicken breast (raw weight, any preparation)", quantity: isWeightGain ? "120" : "80", unit: "g", caloriesKcal: isWeightGain ? 130 : 90, proteinG: isWeightGain ? 25 : 17, carbG: 0, fatG: 2.5 },
          { name: "Wheat Roti", quantity: isWeightGain ? "3" : "2", unit: "pieces", caloriesKcal: isWeightGain ? 240 : 160, proteinG: isWeightGain ? 9 : 6, carbG: isWeightGain ? 45 : 30, fatG: 2 },
          { name: "Sautéed beans & capsicum sabzi", quantity: "100", unit: "g", caloriesKcal: 40, proteinG: 1.5, carbG: 8, fatG: 0 }
        ],
        recipeSteps: ["Boil masoor dal/chicken in pressure cooker with spices", "Temper with jeera and garlic in 1 tsp oil", "Serve hot alongside wheat rotis and carrot/green sabzi."],
        benefitNote: "High-quality whole grains combined with lean protein to rebuild uterine lining efficiently."
      },
      {
        displayName: "High-Fiber Lobia Curry with Jowar Roti",
        items: [
          { name: "Black-eyed peas / Lobia (boiled)", quantity: isWeightGain ? "120" : "80", unit: "g", caloriesKcal: isWeightGain ? 180 : 120, proteinG: isWeightGain ? 10 : 7, carbG: isWeightGain ? 32 : 21, fatG: 1 },
          { name: "Jowar flour / Sorghum millet", quantity: "60", unit: "g", caloriesKcal: 210, proteinG: 6.5, carbG: 44, fatG: 2.5 },
          { name: "Cabbage & Green beans subji", quantity: "100", unit: "g", caloriesKcal: 35, proteinG: 1.5, carbG: 7, fatG: 0 }
        ],
        recipeSteps: ["Knead sorghum flour and roll into rotis", "Cook lobia with standard onion-tomato masala", "Serve hot lobia curry with sorghum roti and sautéed vegetables."],
        benefitNote: "Gluten-free grains and high-fiber legumes which balance metabolic markers."
      }
    ];
    return options[(dayNum - 1) % options.length];
  };

  const getDinnerForDay = (dayNum) => {
    const options = [
      {
        displayName: isVeg ? "Grilled Paneer & Veggies with Roti" : "Grilled Chicken Breast with Stir-Fry Veggies",
        items: isVeg ? [
          { name: isVegan ? "Organic Tofu (firm)" : "Paneer (low-fat)", quantity: isWeightGain ? "120" : "80", unit: "g", caloriesKcal: isWeightGain ? 220 : 150, proteinG: isWeightGain ? 20 : 14, carbG: 3, fatG: 14 },
          { name: "Wheat Roti", quantity: isWeightGain ? "2" : "1", unit: "pieces", caloriesKcal: isWeightGain ? 160 : 80, proteinG: isWeightGain ? 6 : 3, carbG: isWeightGain ? 30 : 15, fatG: 1 },
          { name: "Stir-fried capsicum, broccoli, mushrooms", quantity: "150", unit: "g", caloriesKcal: 45, proteinG: 3, carbG: 8, fatG: 0 }
        ] : [
          { name: "Chicken breast (raw weight, any preparation)", quantity: isWeightGain ? "150" : "100", unit: "g", caloriesKcal: isWeightGain ? 165 : 110, proteinG: isWeightGain ? 31 : 21, carbG: 0, fatG: 3 },
          { name: "Wheat Roti", quantity: isWeightGain ? "2" : "1", unit: "pieces", caloriesKcal: isWeightGain ? 160 : 80, proteinG: isWeightGain ? 6 : 3, carbG: isWeightGain ? 30 : 15, fatG: 1 },
          { name: "Stir-fried capsicum, broccoli, mushrooms", quantity: "150", unit: "g", caloriesKcal: 45, proteinG: 3, carbG: 8, fatG: 0 }
        ],
        recipeSteps: ["Cut protein and veggies into cubes", "Toss in 1 tsp olive oil with salt, pepper, and herbs", "Sauté or grill for 10 minutes until lightly browned. Serve hot with roti."],
        benefitNote: "High-protein, low-carb dinner to promote lean muscle tissue recovery without compromising sleep quality."
      },
      {
        displayName: "Healthy Moong Dal Khichdi",
        items: [
          { name: "Moong dal & brown rice mix (raw weight)", quantity: isWeightGain ? "90" : "60", unit: "g", caloriesKcal: isWeightGain ? 310 : 210, proteinG: isWeightGain ? 14 : 9, carbG: isWeightGain ? 62 : 42, fatG: 2 },
          { name: "Sautéed Spinach / Palak", quantity: "100", unit: "g", caloriesKcal: 25, proteinG: 2, carbG: 3, fatG: 0 },
          { name: "Ghee", quantity: "5", unit: "ml", caloriesKcal: 45, proteinG: 0, carbG: 0, fatG: 5 }
        ],
        recipeSteps: ["Pressure cook dal, rice, spinach, and salt with 3 cups water", "Add a tadka of jeera and hing in ghee", "Serve hot and fresh."],
        benefitNote: "Extremely gentle dinner that allows the digestive system to rest and regulate evening cortisol levels."
      },
      {
        displayName: isVeg ? "Tofu Bhurji with Roti" : "Egg Bhurji with Roti",
        items: isVeg ? [
          { name: "Organic Tofu (firm)", quantity: isWeightGain ? "150" : "100", unit: "g", caloriesKcal: isWeightGain ? 130 : 90, proteinG: isWeightGain ? 15 : 10, carbG: 3, fatG: 5 },
          { name: "Wheat Roti", quantity: isWeightGain ? "2" : "1", unit: "pieces", caloriesKcal: isWeightGain ? 160 : 80, proteinG: isWeightGain ? 6 : 3, carbG: isWeightGain ? 30 : 15, fatG: 1 },
          { name: "Onions, green chillies, tomatoes", quantity: "100", unit: "g", caloriesKcal: 30, proteinG: 1, carbG: 6, fatG: 0 }
        ] : [
          { name: "Whole eggs", quantity: "2", unit: "pieces", caloriesKcal: 140, proteinG: 12, carbG: 1, fatG: 10 },
          { name: "Wheat Roti", quantity: isWeightGain ? "2" : "1", unit: "pieces", caloriesKcal: isWeightGain ? 160 : 80, proteinG: isWeightGain ? 6 : 3, carbG: isWeightGain ? 30 : 15, fatG: 1 },
          { name: "Onions, green chillies, tomatoes", quantity: "100", unit: "g", caloriesKcal: 30, proteinG: 1, carbG: 6, fatG: 0 }
        ],
        recipeSteps: ["Chop veggies finely", "Sauté veggies, add crumbled tofu or beaten eggs", "Stir-fry with turmeric, salt, and red chilli powder. Serve warm with roti."],
        benefitNote: "Anemia protocol optimized dinner that supplies B-vitamins and cellular energy."
      },
      {
        displayName: "High-Protein Lentil Stew with Broccoli",
        items: [
          { name: "Whole Masoor Dal (raw)", quantity: "50", unit: "g", caloriesKcal: 170, proteinG: 12, carbG: 30, fatG: 1 },
          { name: "Broccoli & Mushrooms (steamed)", quantity: "150", unit: "g", caloriesKcal: 45, proteinG: 3, carbG: 8, fatG: 0.5 },
          { name: "Soaked almonds", quantity: "10", unit: "g", caloriesKcal: 60, proteinG: 2, carbG: 2, fatG: 5 }
        ],
        recipeSteps: ["Boil masoor dal with ginger and garlic", "Steam broccoli and mushrooms separately", "Mix together, squeeze fresh lemon and top with almonds."],
        benefitNote: "Packed with anti-inflammatory nutrients and zinc to cleanse hormones and calm acne flare-ups."
      },
      {
        displayName: isVeg ? "Chana Dal with Roti & Bhindi Sabzi" : "Fish Curry with Brown Rice",
        items: isVeg ? [
          { name: "Bengal Gram / Chana Dal (raw)", quantity: "40", unit: "g", caloriesKcal: 145, proteinG: 9, carbG: 24, fatG: 2 },
          { name: "Wheat Roti", quantity: isWeightGain ? "2" : "1", unit: "pieces", caloriesKcal: isWeightGain ? 160 : 80, proteinG: isWeightGain ? 6 : 3, carbG: isWeightGain ? 30 : 15, fatG: 1 },
          { name: "Bhindi (Okra) dry sabzi", quantity: "100", unit: "g", caloriesKcal: 50, proteinG: 2, carbG: 9, fatG: 1.5 }
        ] : [
          { name: "Fish / Rohu or Surmai fillet (raw)", quantity: isWeightGain ? "150" : "100", unit: "g", caloriesKcal: isWeightGain ? 180 : 120, proteinG: isWeightGain ? 28 : 19, carbG: 0, fatG: 7 },
          { name: "Brown rice (raw weight)", quantity: "40", unit: "g", caloriesKcal: 140, proteinG: 3, carbG: 30, fatG: 1 },
          { name: "Tomato curry base", quantity: "100", unit: "g", caloriesKcal: 40, proteinG: 1, carbG: 8, fatG: 0 }
        ],
        recipeSteps: isVeg
          ? ["Pressure cook dal with spices", "Sauté bhindi with pinch of oil and spices", "Serve hot dal, bhindi, and soft wheat roti."]
          : ["Simmer fish in tomato onion fish curry gravy", "Serve hot with steamed brown rice."],
        benefitNote: "Good mix of healthy proteins and fiber for overnight slow metabolic absorption."
      },
      {
        displayName: isVeg ? "Nutritious Paneer Bhurji Roll" : "Shredded Chicken Breast Roll",
        items: isVeg ? [
          { name: isVegan ? "Organic Tofu (firm)" : "Paneer (low-fat)", quantity: "80", unit: "g", caloriesKcal: 150, proteinG: 14, carbG: 2, fatG: 9 },
          { name: "Wheat Roti", quantity: "1", unit: "piece", caloriesKcal: 80, proteinG: 3, carbG: 15, fatG: 1 },
          { name: "Capsicum, onion & cabbage (raw/sautéed)", quantity: "100", unit: "g", caloriesKcal: 30, proteinG: 1, carbG: 6, fatG: 0 }
        ] : [
          { name: "Chicken breast (raw weight, shredded)", quantity: "100", unit: "g", caloriesKcal: 110, proteinG: 21, carbG: 0, fatG: 2 },
          { name: "Wheat Roti", quantity: "1", unit: "piece", caloriesKcal: 80, proteinG: 3, carbG: 15, fatG: 1 },
          { name: "Capsicum, onion & cabbage (raw/sautéed)", quantity: "100", unit: "g", caloriesKcal: 30, proteinG: 1, carbG: 6, fatG: 0 }
        ],
        recipeSteps: ["Sauté shredded chicken or paneer with spices and veggies", "Place inside the wheat roti and roll up tightly", "Toast lightly on the tawa and enjoy."],
        benefitNote: "Convenient yet deeply filling protein-heavy option to maintain glucose stability before sleep."
      },
      {
        displayName: "High-Protein Soy Chunk Curry with Brown Rice",
        items: [
          { name: "Soy chunks (dried weight)", quantity: isWeightGain ? "60" : "40", unit: "g", caloriesKcal: isWeightGain ? 200 : 135, proteinG: isWeightGain ? 31 : 21, carbG: 20, fatG: 0.5 },
          { name: "Brown rice (raw weight)", quantity: "40", unit: "g", caloriesKcal: 140, proteinG: 3, carbG: 30, fatG: 1 },
          { name: "Mixed vegetables curry bases", quantity: "100", unit: "g", caloriesKcal: 40, proteinG: 1, carbG: 8, fatG: 0 }
        ],
        recipeSteps: ["Soak soy chunks in warm water for 15 minutes and squeeze out excess water", "Prepare a light onion tomato masala and stir in chunks", "Cook for 10 minutes and serve with boiled rice."],
        benefitNote: "Superb plant-based protein density to keep hormones stabilized and reduce late-night hunger cravings."
      }
    ];
    return options[(dayNum - 1) % options.length];
  };

  for (let i = 1; i <= 7; i++) {
    const meals = [];
    const frequency = profile.mealFrequency || 5;

    if (frequency >= 5) {
      const isEMTarget = targetMealType === 'early_morning';
      const items = [
        { name: "Ginger (raw)", quantity: "10", unit: "g", caloriesKcal: 5, proteinG: 0.1, carbG: 1.0, fatG: 0 },
        { name: "Lemon / citrus juice", quantity: "1", unit: "tablespoon", caloriesKcal: 3, proteinG: 0.1, carbG: 0.8, fatG: 0 }
      ];
      if (isEMTarget && proteinPowderItem) {
        items.push(proteinPowderItem);
      }
      meals.push({
        id: `meal-mock-em-${i}`,
        mealType: 'early_morning',
        scheduledTime: mealTimes.early_morning,
        displayName: "Morning Wellness Drink",
        items,
        totalCalories: 8 + (isEMTarget ? calcCal : 0),
        totalProtein: Number((0.2 + (isEMTarget ? calcProtein : 0)).toFixed(1)),
        totalCarb: Number((1.8 + (isEMTarget ? calcCarbs : 0)).toFixed(1)),
        totalFat: 0 + (isEMTarget ? calcFat : 0),
        prepMinutes: 5,
        recipeSteps: ["Boil water in a pan", "Add crushed ginger and simmer for 3 minutes", "Strain into a cup, squeeze fresh lemon juice, and drink warm."],
        benefitNote: "Ginger eases gut digestion and reduces hormonal bloating." + (isEMTarget ? absorptionNote : ""),
        isRegenerated: false
      });
    }

    const isBFTarget = targetMealType === 'breakfast';
    const bfData = getBreakfastForDay(i);
    const bfItems = [...bfData.items];
    if (isBFTarget && proteinPowderItem) {
      bfItems.push(proteinPowderItem);
    }
    const bfCal = bfItems.reduce((acc, item) => acc + item.caloriesKcal, 0);
    const bfProtein = bfItems.reduce((acc, item) => acc + item.proteinG, 0);
    const bfCarb = bfItems.reduce((acc, item) => acc + item.carbG, 0);
    const bfFat = bfItems.reduce((acc, item) => acc + item.fatG, 0);
    meals.push({
      id: `meal-mock-bf-${i}`,
      mealType: 'breakfast',
      scheduledTime: mealTimes.breakfast,
      displayName: bfData.displayName,
      items: bfItems,
      totalCalories: Math.round(bfCal),
      totalProtein: Number(bfProtein.toFixed(1)),
      totalCarb: Number(bfCarb.toFixed(1)),
      totalFat: Number(bfFat.toFixed(1)),
      prepMinutes: 10,
      recipeSteps: bfData.recipeSteps,
      benefitNote: bfData.benefitNote + (isBFTarget ? absorptionNote : ""),
      isRegenerated: false
    });

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

    const isLHTarget = targetMealType === 'lunch';
    const lhData = getLunchForDay(i);
    const lhItems = [...lhData.items];
    if (isLHTarget && proteinPowderItem) {
      lhItems.push(proteinPowderItem);
    }
    const lhCal = lhItems.reduce((acc, item) => acc + item.caloriesKcal, 0);
    const lhProtein = lhItems.reduce((acc, item) => acc + item.proteinG, 0);
    const lhCarb = lhItems.reduce((acc, item) => acc + item.carbG, 0);
    const lhFat = lhItems.reduce((acc, item) => acc + item.fatG, 0);
    meals.push({
      id: `meal-mock-lh-${i}`,
      mealType: 'lunch',
      scheduledTime: mealTimes.lunch,
      displayName: lhData.displayName,
      items: lhItems,
      totalCalories: Math.round(lhCal),
      totalProtein: Number(lhProtein.toFixed(1)),
      totalCarb: Number(lhCarb.toFixed(1)),
      totalFat: Number(lhFat.toFixed(1)),
      prepMinutes: 20,
      recipeSteps: lhData.recipeSteps,
      benefitNote: lhData.benefitNote + (isLHTarget ? absorptionNote : ""),
      isRegenerated: false
    });

    if (frequency >= 4) {
      const isESTarget = targetMealType === 'evening_snack';
      const items = isWeightGain ? [
        { name: "Banana", quantity: "150", unit: "g", caloriesKcal: 135, proteinG: 1.5, carbG: 34.0, fatG: 0.5 },
        { name: isVegan ? "Soy milk" : "Whole milk", quantity: "250", unit: "ml", caloriesKcal: isVegan ? 110 : 160, proteinG: isVegan ? 7.0 : 8.5, carbG: isVegan ? 10.0 : 11.5, fatG: isVegan ? 4.5 : 8.5 },
        { name: "Mixed nuts & seeds", quantity: "20", unit: "g", caloriesKcal: 120, proteinG: 4.0, carbG: 4.0, fatG: 10.0 }
      ] : [
        { name: "Moong sprouts (raw)", quantity: "80", unit: "g", caloriesKcal: 90, proteinG: 6.0, carbG: 15.0, fatG: 0.5 },
        { name: "Cucumber & tomato slices", quantity: "40", unit: "g", caloriesKcal: 10, proteinG: 0.4, carbG: 2.0, fatG: 0 }
      ];
      if (isESTarget && proteinPowderItem) {
        items.push(proteinPowderItem);
      }
      const esCal = items.reduce((acc, item) => acc + item.caloriesKcal, 0);
      const esProtein = items.reduce((acc, item) => acc + item.proteinG, 0);
      const esCarb = items.reduce((acc, item) => acc + item.carbG, 0);
      const esFat = items.reduce((acc, item) => acc + item.fatG, 0);
      meals.push({
        id: `meal-mock-es-${i}`,
        mealType: 'evening_snack',
        scheduledTime: mealTimes.evening_snack,
        displayName: "Evening Snack",
        items,
        totalCalories: Math.round(esCal),
        totalProtein: Number(esProtein.toFixed(1)),
        totalCarb: Number(esCarb.toFixed(1)),
        totalFat: Number(esFat.toFixed(1)),
        prepMinutes: 5,
        recipeSteps: isWeightGain 
          ? ["Add banana slices and milk to a blender", "Blend on high until smooth and creamy", "Pour into a glass and top with chopped mixed nuts."]
          : ["Toss sprouts with diced cucumber and tomato", "Season with lemon juice and a pinch of rock salt and serve fresh."],
        benefitNote: isWeightGain
          ? "High-calorie nutrient-dense shake to support healthy weight gain." + (isESTarget ? absorptionNote : "")
          : "High in fiber and plant enzymes to support healthy digestion." + (isESTarget ? absorptionNote : ""),
        isRegenerated: false
      });
    }

    const isDNTarget = targetMealType === 'dinner';
    const dnData = getDinnerForDay(i);
    const dnItems = [...dnData.items];
    if (isDNTarget && proteinPowderItem) {
      dnItems.push(proteinPowderItem);
    }
    const dnCal = dnItems.reduce((acc, item) => acc + item.caloriesKcal, 0);
    const dnProtein = dnItems.reduce((acc, item) => acc + item.proteinG, 0);
    const dnCarb = dnItems.reduce((acc, item) => acc + item.carbG, 0);
    const dnFat = dnItems.reduce((acc, item) => acc + item.fatG, 0);
    meals.push({
      id: `meal-mock-dn-${i}`,
      mealType: 'dinner',
      scheduledTime: mealTimes.dinner,
      displayName: dnData.displayName,
      items: dnItems,
      totalCalories: Math.round(dnCal),
      totalProtein: Number(dnProtein.toFixed(1)),
      totalCarb: Number(dnCarb.toFixed(1)),
      totalFat: Number(dnFat.toFixed(1)),
      prepMinutes: 25,
      recipeSteps: dnData.recipeSteps,
      benefitNote: dnData.benefitNote + (isDNTarget ? absorptionNote : ""),
      isRegenerated: false
    });

    days.push({
      dayNumber: i,
      dayLabel: dayLabels[i - 1],
      meals
    });
  }

  const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const weekLabel = `Week of ${new Date().toLocaleDateString('en-US', dateOptions)}`;

  return {
    userId: profile.userId || 'mock-user-123',
    nutritionProfileId: 'mock-profile-id',
    cyclePhase: phase,
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
};

export default function Nutrition() {
  const user = useAuthStore(state => state.user);
  const userId = user?.id || user?._id || 'mock-user-123';

  // Tab State: 'tracker' or 'plan'
  const [activeTab, setActiveTab] = useState('tracker');
  
  // AI Plan states
  const [activePlan, setActivePlan] = useState(() => {
    const saved = localStorage.getItem(`herverse-${userId}-cached-diet-plan`);
    return saved ? JSON.parse(saved) : null;
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeDayNumber, setActiveDayNumber] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Dark Mode state (synced with localStorage & document.documentElement)
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Calorie tracking states (original states preserved for compatibility)
  const calorieGoal = 1800;
  const [mealCategory, setMealCategory] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [foodLogs, setFoodLogs] = useState(() => {
    const saved = localStorage.getItem(`herverse-${userId}-food-logs`);
    let logs = saved ? JSON.parse(saved) : [
      { id: '1', category: 'Breakfast', name: 'Avocado Toast with Egg', kcal: 320 },
      { id: '2', category: 'Lunch', name: 'Mediterranean Chickpea Salad', kcal: 480 }
    ];
    // Force migrate legacy items
    logs = logs.map(log => {
      if (log.name === 'Grilled Chicken Quinoa Salad') {
        return { ...log, name: 'Mediterranean Chickpea Salad', kcal: 480 };
      }
      return log;
    });
    return logs;
  });

  // Water tracking states (original states preserved)
  const waterGoal = 2500; // in ml
  const [waterLogged, setWaterLogged] = useState(() => {
    const saved = localStorage.getItem(`herverse-${userId}-water-logged`);
    return saved ? Number(saved) : 1000;
  });

  // Load user-specific data from local storage when userId changes
  useEffect(() => {
    setIsLoaded(false);
    
    const savedPlan = localStorage.getItem(`herverse-${userId}-cached-diet-plan`);
    setActivePlan(savedPlan ? JSON.parse(savedPlan) : null);

    const savedFood = localStorage.getItem(`herverse-${userId}-food-logs`);
    if (savedFood) {
      setFoodLogs(JSON.parse(savedFood));
    } else {
      setFoodLogs([
        { id: '1', category: 'Breakfast', name: 'Avocado Toast with Egg', kcal: 320 },
        { id: '2', category: 'Lunch', name: 'Mediterranean Chickpea Salad', kcal: 480 }
      ]);
    }

    const savedWater = localStorage.getItem(`herverse-${userId}-water-logged`);
    setWaterLogged(savedWater ? Number(savedWater) : 1000);
    
    setIsLoaded(true);
  }, [userId]);

  // Fetch active plan on load if not cached or is empty on backend
  useEffect(() => {
    const fetchActivePlan = async () => {
      const savedPlan = localStorage.getItem(`herverse-${userId}-cached-diet-plan`);
      if (!savedPlan) {
        setIsLoading(true);
        setLoadingMessage('Retrieving active cycle synced plan...');
      }
      try {
        const response = await fetch(`/api/nutrition/get-active-plan?userId=${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.plan) {
            setActivePlan(data.plan);
            localStorage.setItem(`herverse-${userId}-cached-diet-plan`, JSON.stringify(data.plan));
            setActiveTab('plan');
          }
        }
      } catch (err) {
        console.error('Failed to fetch plan:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchActivePlan();
    }
  }, [userId]);

  // Sync state changes with local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`herverse-${userId}-food-logs`, JSON.stringify(foodLogs));
    }
  }, [foodLogs, userId, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`herverse-${userId}-water-logged`, waterLogged.toString());
    }
  }, [waterLogged, userId, isLoaded]);

  const totalCalories = foodLogs.reduce((sum, log) => sum + log.kcal, 0);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('herverse-dark-mode', next.toString());
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleAddFood = (e) => {
    e.preventDefault();
    if (!foodName || !calories) return;

    const newFood = {
      id: Date.now().toString(),
      category: mealCategory,
      name: foodName,
      kcal: Number(calories)
    };

    setFoodLogs([newFood, ...foodLogs]);
    setFoodName('');
    setCalories('');
  };

  const handleDeleteFood = (id) => {
    setFoodLogs(foodLogs.filter(f => f.id !== id));
  };

  const handleWaterClick = (amount) => {
    setWaterLogged(prev => Math.min(prev + amount, 4000));
  };

  const handleOnboardingComplete = async (formData, cyclePhase) => {
    setIsLoading(true);
    setLoadingMessage('Saving metrics and computing cycle-synced targets...');
    
    // Save onboarding details locally first
    try {
      localStorage.setItem(`herverse-${userId}-nutrition-profile`, JSON.stringify(formData));
    } catch (e) {
      console.error('Failed to save nutrition profile locally:', e);
    }

    let plan = null;

    // Try saving profile to server (catch failure silently)
    try {
      await fetch('/api/nutrition/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profileData: formData })
      });
    } catch (err) {
      console.warn('Failed to save profile on server, using local fallback:', err);
    }

    setLoadingMessage('Compiling meal recommendations using smart references...');
    
    // Try generating plan via server (catch failure silently)
    try {
      const clientApiKey = localStorage.getItem(`herverse-${userId}-gemini-key`) || localStorage.getItem('herverse-gemini-key') || '';
      const genResponse = await fetch('/api/nutrition/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cyclePhase, clientApiKey })
      });

      if (genResponse.ok) {
        const genData = await genResponse.json();
        if (genData.success && genData.plan) {
          plan = genData.plan;
        }
      }
    } catch (err) {
      console.warn('Server plan generation failed, trying direct Gemini or offline generation:', err);
    }

    // Client-side fallback if server generation failed
    if (!plan) {
      try {
        const bmr = calculateBMR(formData.weightKg, formData.heightCm, formData.age);
        const tdee = calculateTDEE(bmr, formData.activityLevel);
        let targetCalories = Math.round(calculateTargetCalories(tdee, formData.goal));
        
        const phase = (cyclePhase || 'menstrual').toLowerCase();
        const cycleData = CYCLE_MAP[phase] || CYCLE_MAP.menstrual;
        targetCalories += cycleData.calorieAdjust;

        const macros = calculateMacros(targetCalories, formData.goal, formData.healthConditions);

        const clientApiKey = localStorage.getItem(`herverse-${userId}-gemini-key`) || localStorage.getItem('herverse-gemini-key') || '';
        
        if (clientApiKey) {
          try {
            plan = await generatePlanWithDirectGemini(formData, cyclePhase, targetCalories, macros, clientApiKey);
          } catch (geminiErr) {
            console.error('Direct Gemini API generation failed, using mock fallback:', geminiErr);
          }
        }

        if (!plan) {
          plan = generateClientMockPlan(formData, cyclePhase, targetCalories, macros);
        }
      } catch (clientGenErr) {
        console.error('Client-side plan generation error:', clientGenErr);
      }
    }

    if (plan) {
      setActivePlan(plan);
      localStorage.setItem(`herverse-${userId}-cached-diet-plan`, JSON.stringify(plan));
      setIsOnboardingOpen(false);
      setActiveTab('plan');
    } else {
      alert('Could not compile diet plan. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleSwapMeal = async (mealId) => {
    setIsLoading(true);
    setLoadingMessage('Finding alternative meal swap...');
    try {
      let swappedMeal = null;

      // Try server first
      try {
        const clientApiKey = localStorage.getItem(`herverse-${userId}-gemini-key`) || localStorage.getItem('herverse-gemini-key') || '';
        const response = await fetch('/api/nutrition/regenerate-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mealId, clientApiKey })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.meal) {
            swappedMeal = data.meal;
          }
        }
      } catch (serverErr) {
        console.warn('Server meal swap failed, trying client side...', serverErr);
      }

      // Fallback to client-side swap
      if (!swappedMeal && activePlan) {
        // Find the meal target
        let targetMeal = null;
        for (const day of activePlan.days) {
          const m = day.meals.find(meal => meal.id === mealId || meal._id === mealId || meal._id?.toString() === mealId);
          if (m) {
            targetMeal = m;
            break;
          }
        }

        if (targetMeal) {
          const savedProfile = localStorage.getItem(`herverse-${userId}-nutrition-profile`);
          const profile = savedProfile ? JSON.parse(savedProfile) : {
            goal: activePlan.targetCalories > 2000 ? 'weight_gain' : 'weight_loss',
            dietType: 'veg',
            healthConditions: []
          };

          const isVeg = (profile.dietType || 'veg').toLowerCase() !== 'non-veg';
          const isWeightGain = profile.goal === 'weight_gain';
          const phase = (activePlan.cyclePhase || 'menstrual').toLowerCase();
          const cycleData = CYCLE_MAP[phase] || CYCLE_MAP.menstrual;

          const clientApiKey = localStorage.getItem(`herverse-${userId}-gemini-key`) || localStorage.getItem('herverse-gemini-key') || '';
          if (clientApiKey) {
            try {
              swappedMeal = await generateMealSwapWithDirectGemini(profile, activePlan.cyclePhase, targetMeal, clientApiKey);
            } catch (geminiErr) {
              console.error('Direct Gemini meal swap failed, trying offline swap:', geminiErr);
            }
          }

          if (!swappedMeal) {
            swappedMeal = generateOfflineMealSwap(
              targetMeal.mealType,
              targetMeal.displayName,
              isVeg,
              isWeightGain,
              activePlan.targetCalories,
              { proteinG: activePlan.proteinG, carbG: activePlan.carbG, fatG: activePlan.fatG },
              cycleData
            );
          }
        }
      }

      if (swappedMeal) {
        const updatedDays = activePlan.days.map(day => {
          const updatedMeals = day.meals.map(m => {
            if (m.id === mealId || m._id === mealId || m._id?.toString() === mealId) {
              return { ...m, ...swappedMeal, id: mealId, isRegenerated: true };
            }
            return m;
          });
          return { ...day, meals: updatedMeals };
        });

        const newPlan = {
          ...activePlan,
          days: updatedDays
        };

        setActivePlan(newPlan);
        localStorage.setItem(`herverse-${userId}-cached-diet-plan`, JSON.stringify(newPlan));
      } else {
        alert('Could not swap meal. Please try again.');
      }
    } catch (err) {
      console.error('Swap meal error:', err);
      alert('Could not swap meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPlan = () => {
    setActivePlan(null);
    localStorage.removeItem(`herverse-${userId}-cached-diet-plan`);
    setIsOnboardingOpen(true);
    setActiveTab('plan');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay message={loadingMessage} />}

      {/* Title & Theme Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-gradient">Nutrition & Meal Planner</h2>
          <p className="text-muted text-sm">Fuel your body intelligently. Track calories, hydrate, and align meals with your biological cycle.</p>
        </div>
        
        {/* Sun/Moon Theme Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl border border-primary/20 hover:bg-primary/5 text-muted hover:text-primary transition-all-smooth flex items-center gap-2 text-xs font-bold shadow-sm"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} />}
          <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
        </button>
      </div>

      {/* Top Tab Bar Switcher */}
      <div className="flex border-b border-primary/10 gap-6">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all-smooth uppercase tracking-wider ${
            activeTab === 'tracker' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'
          }`}
        >
          Daily Logs & Hydration
        </button>
        <button
          onClick={() => {
            setActiveTab('plan');
            if (!activePlan) {
              setIsOnboardingOpen(true);
            }
          }}
          className={`pb-3 text-sm font-bold border-b-2 transition-all-smooth uppercase tracking-wider ${
            activeTab === 'plan' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'
          }`}
        >
          AI Cycle synced Diet Plan
        </button>
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {activeTab === 'tracker' ? (
          <>
            {/* Left Column: Calorie Logger (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-card p-6 border-primary/20 shadow-md">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Apple className="text-primary" size={22} /> Daily Calorie Budget
                </h3>

                {/* Progress Meters */}
                <div className="grid grid-cols-3 gap-4 items-center mb-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-textMain">{calorieGoal}</p>
                    <p className="text-xs text-muted">Daily Target</p>
                  </div>
                  <div className="relative flex justify-center items-center">
                    <div className="w-28 h-28 rounded-full border-[8px] border-primary/10 border-t-primary border-r-primary flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-gradient">{totalCalories}</span>
                      <span className="text-[10px] text-muted uppercase">Logged</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{Math.max(calorieGoal - totalCalories, 0)}</p>
                    <p className="text-xs text-muted">Calories Left</p>
                  </div>
                </div>

                {/* Add Food Form */}
                <form onSubmit={handleAddFood} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-6">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted mb-1">Meal</label>
                    <select 
                      value={mealCategory} 
                      onChange={e => setMealCategory(e.target.value)}
                      className="w-full bg-white border border-primary/15 rounded-xl px-2 py-2 text-sm text-textMain font-medium cursor-pointer"
                    >
                      <option>Breakfast</option>
                      <option>Lunch</option>
                      <option>Dinner</option>
                      <option>Snacks</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-muted mb-1">Food Item</label>
                    <input 
                      type="text" 
                      value={foodName} 
                      onChange={e => setFoodName(e.target.value)}
                      placeholder="e.g. Banana, Oats, Tofu"
                      className="w-full bg-white border border-primary/20 rounded-xl px-3 py-2 text-sm text-textMain"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted mb-1">Calories</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={calories} 
                        onChange={e => setCalories(e.target.value)}
                        placeholder="kcal"
                        className="w-20 bg-white border border-primary/20 rounded-xl px-2 py-2 text-sm text-textMain"
                        required
                      />
                      <button type="submit" className="p-2 rounded-xl bg-primary text-white hover:opacity-95 shadow-sm active:scale-95 transition-all-smooth">
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </form>

                {/* Food Logs List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {foodLogs.length === 0 ? (
                    <p className="text-center text-sm text-muted py-6">No foods logged today yet.</p>
                  ) : (
                    foodLogs.map((log) => (
                      <div key={log.id} className="bg-white/95 border border-primary/10 rounded-xl p-3 flex justify-between items-center shadow-sm">
                        <div>
                          <span className="text-[10px] uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full mr-2">{log.category}</span>
                          <span className="text-sm font-semibold text-textMain">{log.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-textMain">{log.kcal} kcal</span>
                          <button onClick={() => handleDeleteFood(log.id)} className="text-muted hover:text-red-500 transition-colors p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Hydration Widget (lg:col-span-5) */}
            <div className="lg:col-span-5">
              <div className="glass-card p-6 border-primary/20 shadow-md h-full flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[460px]">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 self-start">
                  <Droplet className="text-secondary animate-bounce" size={22} /> Water Intake Tracker
                </h3>
                <p className="text-xs text-muted max-w-xs mb-8 self-start text-left">Stay hydrated to combat fluid retention, support skin health, and smooth digestive cycles.</p>

                {/* Glass Visual */}
                <div className="relative w-36 h-56 border-[6px] border-primary/20 rounded-b-3xl border-t-0 flex flex-col justify-end overflow-hidden mb-8 shadow-inner bg-white/30">
                  <motion.div 
                    className="bg-secondary w-full rounded-b-2xl"
                    animate={{ height: `${Math.min((waterLogged / waterGoal) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-display font-extrabold z-10 text-textMain drop-shadow-sm">
                    <span className="text-3xl">{waterLogged}</span>
                    <span className="text-[10px] text-muted tracking-wider uppercase font-sans">/ {waterGoal} ml</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mb-6 w-full max-w-sm">
                  <button 
                    onClick={() => handleWaterClick(250)}
                    className="flex-1 py-3 rounded-xl bg-white border border-primary/20 text-sm font-bold text-primary hover:bg-primary/5 shadow-sm transition-all-smooth"
                  >
                    + 250ml
                  </button>
                  <button 
                    onClick={() => handleWaterClick(500)}
                    className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-95 shadow-md transition-all-smooth"
                  >
                    + 500ml
                  </button>
                </div>

                {/* Reset button */}
                <button 
                  onClick={() => setWaterLogged(0)}
                  className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1.5 font-semibold"
                >
                  <RefreshCw size={12} /> Reset Hydration Log
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Diet Plan Maker Tab */
          <div className="lg:col-span-12 w-full space-y-6">
            {isOnboardingOpen ? (
              <OnboardingShell onComplete={handleOnboardingComplete} />
            ) : activePlan ? (
              <div className="space-y-6">
                {/* PDF Container Wrapper */}
                <div id="nutrition-plan-pdf" className="space-y-6 p-4 rounded-3xl">
                  {/* Header info */}
                  <PlanHeader plan={activePlan} onReset={handleResetPlan} />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {/* Donut Macro Charts */}
                    <div className="md:col-span-2">
                      <MacroRing
                        targetCalories={activePlan.targetCalories}
                        proteinG={activePlan.proteinG}
                        carbG={activePlan.carbG}
                        fatG={activePlan.fatG}
                      />
                    </div>

                    {/* Quick Cycle Syncing tips */}
                    <div className="glass-card p-6 border-primary/20 shadow-md flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Award size={14} />
                          <span>Cycle Synced Science</span>
                        </h4>
                        <p className="text-xs text-textMain leading-relaxed font-medium">
                          Your metabolic demands shift dynamically across phases. Estrogen levels modulate fat metabolism, while progesterone requires higher protein and steady complex starches.
                        </p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-primary/5 flex items-center justify-between text-[10px] text-muted font-bold uppercase">
                        <span>Phase focused nutrition</span>
                        <CalendarRange size={14} className="text-secondary" />
                      </div>
                    </div>
                  </div>

                  {/* Day Navigation Tabs */}
                  <div className="flex justify-center md:justify-start pt-2">
                    <WeekTabNav activeDay={activeDayNumber} onChange={setActiveDayNumber} />
                  </div>

                  {/* Single Day meals list display */}
                  <DayView
                    day={activePlan.days.find(d => d.dayNumber === activeDayNumber)}
                    onSwapMeal={handleSwapMeal}
                  />
                </div>

                {/* PDF Download Button */}
                <div className="flex justify-end pr-4">
                  <DownloadPlanButton targetId="full-week-pdf-export" filename={`herverse-diet-${activePlan.cyclePhase}-weekly-plan.pdf`} />
                </div>

                {/* Off-screen container for full-week PDF export */}
                <div 
                  id="full-week-pdf-export" 
                  className="absolute -left-[9999px] top-0 w-[800px] bg-white text-slate-800 p-8 rounded-3xl space-y-8 font-sans"
                >
                  {/* Brand header */}
                  <div className="flex justify-between items-end border-b-2 border-pink-100 pb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-pink-600">HerVerse AI</h1>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Personalized Cycle-Synced Wellness</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold bg-pink-50 text-pink-700 border border-pink-100 px-4 py-1.5 rounded-full uppercase tracking-wider">
                        {activePlan.cyclePhase} Phase Plan
                      </span>
                    </div>
                  </div>

                  {/* Summary statistics bar */}
                  <div className="grid grid-cols-4 gap-4 text-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{activePlan.targetCalories}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily kcal</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-pink-600">{activePlan.proteinG}g</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Protein</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-700">{activePlan.carbG}g</p>
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider">Carbs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-700">{activePlan.fatG}g</p>
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider">Fats</p>
                    </div>
                  </div>

                  {/* Focus notes */}
                  <div className="bg-pink-50/50 p-5 rounded-2xl border border-pink-100/50 space-y-1">
                    <h4 className="text-xs font-bold text-pink-700 uppercase tracking-wider">Phase Focus & Guidance</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {activePlan.cycleBenefitNote || activePlan.keyFocusNote}
                    </p>
                  </div>

                  {/* 7 Days detailed plan list */}
                  <div className="space-y-6">
                    {activePlan.days.map((day) => (
                      <div key={day.dayNumber} className="border border-slate-100 rounded-2xl p-6 bg-white shadow-sm space-y-4">
                        <h3 className="text-lg font-bold text-pink-700 border-b border-pink-100 pb-2">{day.dayLabel}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {day.meals.map((meal, mIdx) => (
                            <div key={mIdx} className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">{meal.displayName}</span>
                                <span className="text-xs text-slate-400 font-bold bg-white px-2 py-0.5 rounded border border-slate-100">{meal.scheduledTime}</span>
                              </div>
                              <ul className="text-xs space-y-1.5 pl-4 list-disc text-slate-600 font-medium">
                                {meal.items.map((item, itemIdx) => (
                                  <li key={itemIdx}>
                                    <strong>{item.name}</strong> - {item.quantity} {item.unit} ({item.caloriesKcal} kcal)
                                  </li>
                                ))}
                              </ul>
                              <p className="text-[10px] font-medium text-slate-400 italic leading-relaxed pt-1 border-t border-slate-200/50">
                                💡 {meal.benefitNote}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-8 border-t border-slate-100 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Generated dynamically by HerVerse AI • Empowering Women's Wellness
                  </div>
                </div>
              </div>
            ) : (
              /* Onboarding CTA */
              <div className="max-w-2xl mx-auto glass-card p-8 border-primary/20 shadow-md text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-3xl">🌸</div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-extrabold text-gradient">AI Cycle-Synced Diet Plan Maker</h3>
                  <p className="text-sm text-muted leading-relaxed max-w-lg mx-auto">
                    Generate a personalized 7-day meal plan tailored to your biological cycle phase, physical metrics, weight goals, allergies, and diagnosed health conditions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4">
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/5">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Cycle Syncing</h4>
                    <p className="text-[11px] text-muted leading-normal">Optimizes calories, macros, and micro-nutrients according to hormonal shifts.</p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/5">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Condition Overrides</h4>
                    <p className="text-[11px] text-muted leading-normal">Supports management of diagnosed PCOS, Thyroid, or Endometriosis.</p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/5">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Meal Swaps</h4>
                    <p className="text-[11px] text-muted leading-normal">Dynamically swap individual meals to generate fresh, nutritious alternatives.</p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setIsOnboardingOpen(true)}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm hover:opacity-95 shadow-md shadow-primary/10 active:scale-95 transition-all cursor-pointer"
                  >
                    Start Diet Profile Onboarding
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
