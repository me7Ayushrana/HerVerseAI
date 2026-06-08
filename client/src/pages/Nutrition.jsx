import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Droplet, Calendar, Plus, RefreshCw, Trash2, Award } from 'lucide-react';

export default function Nutrition() {
  // Calorie tracking states
  const calorieGoal = 1800;
  const [mealCategory, setMealCategory] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [foodLogs, setFoodLogs] = useState(() => {
    const saved = localStorage.getItem('herverse-food-logs');
    return saved ? JSON.parse(saved) : [
      { id: '1', category: 'Breakfast', name: 'Avocado Toast with Egg', kcal: 320 },
      { id: '2', category: 'Lunch', name: 'Mediterranean Chickpea Salad', kcal: 480 }
    ];
  });

  // Water tracking states
  const waterGoal = 2500; // in ml
  const [waterLogged, setWaterLogged] = useState(() => {
    const saved = localStorage.getItem('herverse-water-logged');
    return saved ? Number(saved) : 1000;
  });

  // Cycle phase recommendation state
  const [selectedPhase, setSelectedPhase] = useState('Luteal');

  // Diet Profile selections
  const [dietType, setDietType] = useState(() => localStorage.getItem('herverse-diet-type') || 'veg');
  const [lactoseFree, setLactoseFree] = useState(() => localStorage.getItem('herverse-lactose-free') === 'true');
  const [takingSupplements, setTakingSupplements] = useState(() => localStorage.getItem('herverse-supplements') === 'true');
  const [dietGoal, setDietGoal] = useState(() => localStorage.getItem('herverse-diet-goal') || 'Hormone Balance');
  const [viewTab, setViewTab] = useState('guide'); // 'guide' or 'meal-plan'

  useEffect(() => {
    localStorage.setItem('herverse-diet-type', dietType);
  }, [dietType]);

  useEffect(() => {
    localStorage.setItem('herverse-lactose-free', lactoseFree.toString());
  }, [lactoseFree]);

  useEffect(() => {
    localStorage.setItem('herverse-supplements', takingSupplements.toString());
  }, [takingSupplements]);

  useEffect(() => {
    localStorage.setItem('herverse-diet-goal', dietGoal);
  }, [dietGoal]);

  useEffect(() => {
    localStorage.setItem('herverse-food-logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('herverse-water-logged', waterLogged.toString());
  }, [waterLogged]);

  const totalCalories = foodLogs.reduce((sum, log) => sum + log.kcal, 0);

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

  const getCycleRecs = (phase) => {
    const isVeg = dietType === 'veg';
    const isVegan = dietType === 'vegan';
    const isLactoseFree = lactoseFree;
    
    const recs = {
      Menstrual: {
        slogan: "Focus on replenishing iron and zinc lost during bleeding.",
        emoji: "🍲",
        supplements: "Iron Bisglycinate (with Vitamin C) & Magnesium Glycinate",
        naturalNutrients: isVegan || isVeg 
          ? "Spinach, pumpkin seeds, lentils, dark chocolate, and organic tofu."
          : "Grass-fed beef, spinach, pumpkin seeds, lentils, and dark chocolate.",
        foods: [
          {
            name: "Iron Boost Salad",
            ingredients: "Baby Spinach, Beetroot, Mandarin Oranges, Pumpkin Seeds",
            reason: "Spinach & seeds supply iron; citrus Vitamin C helps iron absorption."
          },
          {
            name: isVegan || isVeg ? "Seared Sesame Tofu & Broccoli" : "Seared Salmon & Broccoli",
            ingredients: isVegan || isVeg 
              ? "Organic Tofu, Steamed Broccoli, Sesame Oil, Quinoa"
              : "Wild-caught Salmon, Steamed Broccoli, Quinoa",
            reason: isVegan || isVeg 
              ? "Tofu offers plant protein and iron; sesame oil decreases cramp severity."
              : "Salmon is rich in omega-3 healthy fats to soothe inflammation; quinoa supplies complex proteins."
          }
        ]
      },
      Follicular: {
        slogan: "Incorporate light, fresh foods that support processing rising estrogen.",
        emoji: "🥗",
        supplements: "B-Complex (methylated), Vitamin D3+K2, and Probiotics",
        naturalNutrients: isLactoseFree
          ? "Coconut yogurt, fermented kimchi, sprouted seeds, and leafy greens."
          : "Standard kefir, Greek yogurt, sprouted seeds, and leafy greens.",
        foods: [
          {
            name: "Estrogen Balance Bowl",
            ingredients: `${isLactoseFree ? 'Coconut-kefir' : 'Kefir'} dressing, Fermented Kimchi, Avocado, Sprouts, ${isVegan || isVeg ? 'Tempeh' : 'Grilled Chicken'}`,
            reason: "Gut-friendly fermented ingredients support estrogen detoxification and liver processing."
          },
          {
            name: "Blossom Green Smoothie",
            ingredients: "Celery, Green Apples, Flaxseed, Matcha, Almond milk",
            reason: "Cruciferous nutrients & flax lignans bind to excess estrogen to flush hormonal load."
          }
        ]
      },
      Ovulation: {
        slogan: "High energy phase! Prioritize antioxidant protection and cellular defense.",
        emoji: "🍣",
        supplements: "Zinc Picolinate, Coenzyme Q10 (CoQ10), and Omega-3 (Algae/Fish)",
        naturalNutrients: isVegan || isVeg
          ? "Chia seeds, flaxseeds, walnuts, fresh berries, and sesame seeds."
          : "Wild-caught salmon, chia seeds, walnuts, fresh berries, and sesame seeds.",
        foods: [
          {
            name: "Vitality Fruit & Seed Plate",
            ingredients: `Strawberries, Blueberries, Walnuts, Sesame seed glaze, ${isLactoseFree ? 'Almond-based cheese' : 'Cottage cheese'}`,
            reason: "Antioxidants defend ovulatory cells; seeds provide zinc for egg quality."
          },
          {
            name: isVegan || isVeg ? "Crispy Sesame Tofu Skewers" : "Sesame Crusted Tuna Steak",
            ingredients: isVegan || isVeg
              ? "Firm Tofu, Bell Peppers, Red Cabbage Slaw, Ginger Sesame Glaze"
              : "Ahi Tuna, Red Cabbage Slaw, Ginger sesame oil",
            reason: isVegan || isVeg
              ? "Soy isoflavones support high-estrogen balance; cabbage offers liver detox."
              : "Tuna delivers omega-3 fatty acids that optimize follicular release."
          }
        ]
      },
      Luteal: {
        slogan: "Reduce PMS cravings and bloating with magnesium, B6, and slow carbs.",
        emoji: "🥣",
        supplements: "Magnesium Bisglycinate, Vitamin B6, and Evening Primrose Oil",
        naturalNutrients: isLactoseFree
          ? "Sweet potatoes, bananas, chickpeas, dark chocolate, and coconut-milk yogurt."
          : "Sweet potatoes, bananas, chickpeas, dark chocolate, and Greek yogurt.",
        foods: [
          {
            name: "Magnesium Stew & Sweet Potato",
            ingredients: "Roasted Sweet Potato, Steamed Kale, Chickpeas, Tahini sauce",
            reason: "Slow-burning complex carbs ease sweet cravings; chickpeas provide vitamin B6 to lift progesterone."
          },
          {
            name: "Relax Dark Chocolate Parfait",
            ingredients: `${isLactoseFree ? 'Coconut milk Yogurt' : 'Greek Yogurt'}, Chia seeds, 85% Dark Chocolate shavings`,
            reason: "Dark chocolate supplies magnesium to soothe uterine contractions and ease mood swings."
          }
        ]
      }
    };

    return recs[phase];
  };

  const getCustomMealPlan = (goal, phase, diet, lactose) => {
    const isVeg = diet === 'veg' || diet === 'vegan';
    const isVegan = diet === 'vegan';
    const isLactoseFree = lactose;

    const proteinBreakfast = isVegan 
      ? "Scrambled Tofu with Turmeric" 
      : (isVeg ? "Organic Egg Scramble" : "Smoked Salmon & Egg White Scramble");
      
    const dairyYogurt = isLactoseFree ? "Coconut-milk Yogurt" : "Greek Yogurt";
    const dairyCheese = isLactoseFree ? "Almond-based Feta" : "Goat Feta Cheese";
    
    const lunchProtein = isVegan || isVeg
      ? "Crispy Tempeh Cubes"
      : "Grilled Herb Chicken Breast";
      
    const dinnerProtein = isVegan || isVeg
      ? "Pan-Seared Organic Tofu Steaks"
      : "Wild-Caught Salmon Fillet";

    const plans = {
      "Hormone Balance": {
        Menstrual: {
          breakfast: {
            meal: "Iron-Rich Green Smoothie",
            ingredients: `Spinach, Chia Seeds, Almond Milk, Pea Protein, and Pumpkin Seeds.`,
            benefits: "Provides bioavailable plant iron and magnesium to ease menstrual cramps."
          },
          lunch: {
            meal: "Warm Quinoa & Lentil Bowl",
            ingredients: `Quinoa, Brown Lentils, Roasted Beetroot, Kale, and Olive Oil.`,
            benefits: "Complex carbs stabilize blood sugar while beets support red blood cell replenishment."
          },
          dinner: {
            meal: isVeg ? "Sesame Ginger Tofu & Broccoli stir-fry" : "Baked Salmon & Broccoli",
            ingredients: `${dinnerProtein}, Steamed Broccoli florets, Garlic, Ginger, Sesame seeds, and Quinoa.`,
            benefits: "Omega-3s from seeds/fish reduce inflammation; broccoli contains DIM to support estrogen clearance."
          },
          snack: {
            meal: "Magnesium Boost Parfait",
            ingredients: `${dairyYogurt}, 85% Dark Chocolate shavings, and Raw Walnuts.`,
            benefits: "Magnesium-dense chocolate helps soothe uterine muscle contractions."
          }
        },
        Follicular: {
          breakfast: {
            meal: "Estrogen-Metabolizing Berry Bowl",
            ingredients: `${dairyYogurt}, Ground Flaxseeds, Raspberries, and Pumpkin Seeds.`,
            benefits: "Flax lignans bind to excess estrogen, preventing estrogen dominance during this rising phase."
          },
          lunch: {
            meal: "Sprouted Grain & Avocado Toast",
            ingredients: "Sprouted Rye bread, mashed Avocado, Clover Sprouts, and Cherry Tomatoes.",
            benefits: "B-vitamins in sprouted grains support follicular development and rising energy levels."
          },
          dinner: {
            meal: "Estrogen Balance Tempeh / Chicken Bowl",
            ingredients: `${lunchProtein}, Fermented Kimchi, Avocado slices, Brown Rice, and Cucumber.`,
            benefits: "Fermented kimchi supports gut microbiota critical for metabolizing estrogen."
          },
          snack: {
            meal: "Green Vitality Juice & Almonds",
            ingredients: "Celery, Cucumber, Apple, Ginger, and a handful of Raw Almonds.",
            benefits: "Supports liver detoxification pathways to process hormones cleanly."
          }
        },
        Ovulation: {
          breakfast: {
            meal: "Anti-inflammatory Berry Oatmeal",
            ingredients: "Steel-Cut Oats, Blueberries, Chia Seeds, Cinnamon, and Hemp Hearts.",
            benefits: "High in antioxidants to protect ovulatory cells and support peak hormone transitions."
          },
          lunch: {
            meal: "Rainbow Quinoa & Veggie Medley",
            ingredients: `Quinoa, Bell Peppers, Carrots, Chickpeas, and ${dairyCheese}.`,
            benefits: "Zinc in chickpeas and seeds supports progesterone synthesis and egg quality."
          },
          dinner: {
            meal: isVeg ? "Sesame Tofu Steak with Asparagus" : "Sesame Tuna Steak with Asparagus",
            ingredients: `${isVeg ? 'Organic Tofu' : 'Ahi Tuna'}, Sesame crust, Roasted Asparagus, and Jasmine Rice.`,
            benefits: "Sesame lignans support hormone balance; asparagus acts as a natural prebiotic."
          },
          snack: {
            meal: "Fig & Walnut Plate",
            ingredients: "Fresh Figs, Walnuts, and a drizzle of Maple syrup.",
            benefits: "Walnuts provide essential fatty acids for optimal follicular release."
          }
        },
        Luteal: {
          breakfast: {
            meal: "Sweet Potato Hash & Protein",
            ingredients: `${proteinBreakfast}, Roasted Sweet Potato cubes, Spinach, and Olive oil.`,
            benefits: "Slow-burning complex carbs help prevent PMS-driven sugar cravings."
          },
          lunch: {
            meal: "Progesterone Support Salad",
            ingredients: `Baby Spinach, Roasted Chickpeas, Sunflower Seeds, Cucumber, and Tahini dressing.`,
            benefits: "Chickpeas offer Vitamin B6, which is crucial for progesterone production."
          },
          dinner: {
            meal: "Butternut Squash & Protein Bake",
            ingredients: `${dinnerProtein}, Roasted Butternut Squash, Brussels sprouts, and Quinoa.`,
            benefits: "Fiber-rich vegetables support digestive transit to eliminate metabolized hormones."
          },
          snack: {
            meal: "Avocado Chocolate Mousse",
            ingredients: "Ripe Avocado, Cacao powder, Maple syrup, and Almond milk blended.",
            benefits: "Rich in healthy monounsaturated fats and magnesium to ease bloating."
          }
        }
      },
      "Metabolic Reset": {
        Menstrual: {
          breakfast: {
            meal: "High-Protein Veggie Scramble",
            ingredients: `${proteinBreakfast}, Spinach, Mushrooms, and half an Avocado.`,
            benefits: "Keeps insulin stable while replenishing iron and protein stores."
          },
          lunch: {
            meal: "Low-GI Chickpea & Avocado Bowl",
            ingredients: "Chickpeas, Avocado, Tomatoes, Arugula, Lemon-tahini dressing.",
            benefits: "Slow carbs and clean fats keep cravings low during bleeding."
          },
          dinner: {
            meal: "Baked Protein & Green Beans",
            ingredients: `${dinnerProtein}, Steamed Green Beans, Cauliflower mash, and Olive oil.`,
            benefits: "Low-calorie density, high protein to support evening metabolic rate."
          },
          snack: {
            meal: "Spiced Pumpkin Seeds",
            ingredients: "Roasted Pumpkin Seeds, Cayenne pepper, Sea salt.",
            benefits: "Supplies zinc and healthy fats without causing insulin spikes."
          }
        },
        Follicular: {
          breakfast: {
            meal: "Matcha Protein Smoothie",
            ingredients: `Matcha powder, Vanilla Plant Protein, Almond milk, Chia Seeds, and Spinach.`,
            benefits: "EGCG in matcha boosts thermogenesis; protein maintains muscle satiety."
          },
          lunch: {
            meal: "Metabolic Greens Salad",
            ingredients: `${lunchProtein}, Mixed Greens, Cucumber, Pumpkin Seeds, Apple cider vinegar dressing.`,
            benefits: "Apple cider vinegar improves insulin sensitivity post-meal."
          },
          dinner: {
            meal: "Stir-fried Cauliflower Rice",
            ingredients: `${isVeg ? 'Tempeh' : 'Shrimp/Chicken'}, Cauliflower Rice, Peas, Carrots, Coconut aminos.`,
            benefits: "Low-carb high-fiber alternative that keeps blood glucose flat."
          },
          snack: {
            meal: "Celery Sticks & Almond Butter",
            ingredients: "Fresh Celery sticks with 1 tbsp of natural Almond Butter.",
            benefits: "High fiber and healthy monounsaturated fats for clean snack energy."
          }
        },
        Ovulation: {
          breakfast: {
            meal: "Chia Seed Pudding",
            ingredients: `Chia Seeds, Almond Milk, Raspberries, and Stevia/Monkfruit.`,
            benefits: "High fiber content (10g+) stabilizes appetite during high-estrogen surges."
          },
          lunch: {
            meal: "Quinoa Veggie Salad",
            ingredients: `Quinoa, Cherry Tomatoes, Zucchini, Mint, Lemon, and ${dairyCheese}.`,
            benefits: "Complex carbs supply energy for ovulation without heavy insulin demand."
          },
          dinner: {
            meal: "Zucchini Noodles with Pesto",
            ingredients: `${dinnerProtein}, Spiralized Zucchini, Basil Pesto, and Pine nuts.`,
            benefits: "Healthy fats from pesto combined with lean protein optimizes muscle recovery."
          },
          snack: {
            meal: "Cottage Cheese / Almond Cheese & Berries",
            ingredients: `${isLactoseFree ? 'Almond cheese' : 'Low-fat Cottage Cheese'} topped with Strawberries.`,
            benefits: "Slow-digesting casein/almond protein prevents late afternoon energy slumps."
          }
        },
        Luteal: {
          breakfast: {
            meal: "Ketogenic Avocado Egg / Tofu Bake",
            ingredients: `1 Ripe Avocado baked with ${isVegan ? 'Tofu Scramble' : 'Eggs'}, topped with Chives.`,
            benefits: "High fat, low carb helps suppress the increased appetite typical of the luteal phase."
          },
          lunch: {
            meal: "Warm Lentil & Spinach Soup",
            ingredients: "Brown Lentils, Spinach, Celery, Onions, Garlic, Cumin.",
            benefits: "High fiber keeps bowel movements regular during hormone shifts."
          },
          dinner: {
            meal: "Lean Protein & Roasted Broccoli",
            ingredients: `${dinnerProtein}, Roasted Broccoli with garlic, and Quinoa.`,
            benefits: "Supplies building blocks for metabolic repair and hormone synthesis."
          },
          snack: {
            meal: "Cacao Nut Butter Bites",
            ingredients: "Raw Cacao nibs, Almond Butter, Coconut oil, Stevia.",
            benefits: "Satisfies chocolate cravings without raising blood glucose levels."
          }
        }
      },
      "Energy & Strength": {
        Menstrual: {
          breakfast: {
            meal: "Power Oats Bowl",
            ingredients: "Rolled Oats, Banana slices, Hemp Seeds, Peanut Butter, Oat milk.",
            benefits: "Refuels glycogen stores and provides iron to support gentle movement."
          },
          lunch: {
            meal: "Sweet Potato Quinoa Salad",
            ingredients: `Quinoa, Roasted Sweet Potatoes, black beans, corn, and ${lunchProtein}.`,
            benefits: "High in complex carbs to sustain energy levels during cycle-related fatigue."
          },
          dinner: {
            meal: "Steak / Tempeh Rice Bowl",
            ingredients: `${isVeg ? 'Tempeh' : 'Lean Beef/Chicken'}, Jasmine Rice, Sauteed Kale, Sesame seeds.`,
            benefits: "Supplies essential iron and amino acids to support athletic repair."
          },
          snack: {
            meal: "Nut Butter Dates",
            ingredients: "Medjool Dates stuffed with Almond Butter and Sea salt.",
            benefits: "Quick, natural glucose and potassium source for immediate cellular energy."
          }
        },
        Follicular: {
          breakfast: {
            meal: "Berry Power Smoothie",
            ingredients: "Mixed Berries, Banana, Whey/Plant Protein, Coconut water, Flaxseeds.",
            benefits: "Hydrating and nutrient-dense to support ascending training volume."
          },
          lunch: {
            meal: "Mediterranean Wrap",
            ingredients: `Whole Wheat Wrap, Hummus, Spinach, Cucumber, Feta, and ${lunchProtein}.`,
            benefits: "Balanced macro profile (carbs, protein, fats) for sustained energy."
          },
          dinner: {
            meal: "Grilled Salmon / Tofu & Quinoa",
            ingredients: `${dinnerProtein}, Quinoa, Roasted Asparagus, Olive oil.`,
            benefits: "High omega-3s and amino acids for muscle protein synthesis."
          },
          snack: {
            meal: "Boiled Eggs / Baked Tofu & Apple",
            ingredients: `${isVegan ? 'Savory Baked Tofu' : '2 Hard-boiled Eggs'} and 1 Green Apple.`,
            benefits: "Ideal pre-workout protein and complex carb snack."
          }
        },
        Ovulation: {
          breakfast: {
            meal: "Avo-Toast with Eggs / Tofu",
            ingredients: `Sourdough bread, mashed Avocado, ${isVegan ? 'Tofu scramble' : '2 Poached Eggs'}, Hemp seeds.`,
            benefits: "Healthy fats support high estrogen production and boost physical strength."
          },
          lunch: {
            meal: "High-Energy Quinoa Bowl",
            ingredients: `Quinoa, Chickpeas, Roasted Pumpkin, Walnuts, and ${lunchProtein}.`,
            benefits: "Iron and healthy fats support aerobic endurance."
          },
          dinner: {
            meal: "Teriyaki Rice Plate",
            ingredients: `${dinnerProtein}, Jasmine Rice, Stir-fried Broccoli, Sesame glaze.`,
            benefits: "Replenishes muscle glycogen after intense ovulation-phase workouts."
          },
          snack: {
            meal: "Protein Shake & Almonds",
            ingredients: "Chocolate Protein Powder blended with Almond Milk and Almonds.",
            benefits: "Promotes immediate cellular recovery post-exercise."
          }
        },
        Luteal: {
          breakfast: {
            meal: "Peanut Butter Oatmeal",
            ingredients: "Oats, Peanut Butter, Banana, Chia seeds, Almond Milk.",
            benefits: "Provides slow-release energy to combat luteal phase sluggishness."
          },
          lunch: {
            meal: "Sweet Potato Bowl",
            ingredients: `Roasted Sweet Potato, Black Beans, Spinach, Avocado, and ${lunchProtein}.`,
            benefits: "Complex carbs stabilize mood-regulating serotonin levels."
          },
          dinner: {
            meal: "Stuffed Bell Peppers",
            ingredients: `Bell Peppers stuffed with Quinoa, Black Beans, Corn, and ${isVeg ? 'Tofu crumble' : 'Turkey/Chicken'}.`,
            benefits: "High in antioxidants and minerals to mitigate pre-menstrual inflammation."
          },
          snack: {
            meal: "Dark Chocolate & Peanut Butter",
            ingredients: "2 squares of Dark Chocolate with 1 tbsp of Peanut Butter.",
            benefits: "Magnesium and healthy fats help reduce pre-period cramping."
          }
        }
      },
      "Fertility Support": {
        Menstrual: {
          breakfast: {
            meal: "Folate-Rich Green Smoothie",
            ingredients: "Spinach, Avocado, Kiwi, Almond Milk, Chia Seeds, Folate-active Yeast.",
            benefits: "Folate and healthy fats support cellular health from day one of the cycle."
          },
          lunch: {
            meal: "Lentil & Beetroot Salad",
            ingredients: "Lentils, roasted Beetroot, Walnuts, Arugula, Lemon vinaigrette.",
            benefits: "Iron and zinc lost during bleeding are replenished to support egg growth."
          },
          dinner: {
            meal: "Baked Salmon / Sesame Tofu",
            ingredients: `${dinnerProtein}, Sweet Potato mash, steamed Asparagus.`,
            benefits: "Asparagus provides natural folate; salmon supplies essential DHA."
          },
          snack: {
            meal: "Walnuts & Pumpkin Seeds",
            ingredients: "A mix of Raw Walnuts and Pumpkin Seeds.",
            benefits: "Zinc and selenium support follicle cell division."
          }
        },
        Follicular: {
          breakfast: {
            meal: "Fertility Berry Yogurt Parfait",
            ingredients: `${dairyYogurt}, Raspberries, Flaxseeds, Sunflower seeds, and Honey.`,
            benefits: "Lignans in flax support healthy estrogen levels essential for uterine lining thickness."
          },
          lunch: {
            meal: "Avocado & Egg / Tofu Salad Wrap",
            ingredients: `Whole wheat wrap, mashed Avocado, ${isVegan ? 'Seasoned Tofu' : 'Egg Salad'}, Spinach.`,
            benefits: "Choline in eggs and soy supports early neural cell development."
          },
          dinner: {
            meal: "Rainbow Stir-Fry",
            ingredients: `${lunchProtein}, Bell Peppers, Broccoli, Carrots, Cashews, Brown Rice.`,
            benefits: "Antioxidants protect egg quality from oxidative stress."
          },
          snack: {
            meal: "Pomegranate Seeds & Cashews",
            ingredients: "Fresh Pomegranate seeds and raw Cashew nuts.",
            benefits: "Pomegranate improves uterine blood flow and support endometrial health."
          }
        },
        Ovulation: {
          breakfast: {
            meal: "CoQ10 Energizing Smoothie",
            ingredients: "Sesame seeds, Spinach, Blueberries, Almond Milk, Avocado, Hemp Protein.",
            benefits: "Sesame seeds supply zinc and selenium to optimize mature egg release."
          },
          lunch: {
            meal: "Salmon / Tofu Quinoa Medley",
            ingredients: `Quinoa, Cucumber, Tomatoes, Mint, Olive oil, and ${isVeg ? 'Tofu' : 'Salmon'}.`,
            benefits: "Essential fatty acids help increase cervical mucus quality."
          },
          dinner: {
            meal: isVeg ? "Lentil Shepherd's Pie" : "Baked Cod / Halibut with Asparagus",
            ingredients: isVeg 
              ? "Brown lentils, carrots, peas, topped with Sweet Potato mash."
              : "White fish fillet, Asparagus spears, Roasted Sweet Potatoes.",
            benefits: "Lean selenium-rich proteins support successful fertilization."
          },
          snack: {
            meal: "Brazil Nuts & Berries",
            ingredients: "2 Brazil Nuts (supplies 100% daily Selenium) and organic Blackberries.",
            benefits: "Selenium protects the thyroid and supports reproductive health."
          }
        },
        Luteal: {
          breakfast: {
            meal: "Warm Spiced Quinoa Porridge",
            ingredients: "Quinoa, Almond milk, Cinnamon, Nutmeg, Walnuts, and Pear slices.",
            benefits: "Warming spices support progesterone production and blood circulation to the uterus."
          },
          lunch: {
            meal: "Progesterone-Boosting Sweet Potato Salad",
            ingredients: `Roasted Sweet Potatoes, Black Beans, Spinach, Avocado, and ${isVeg ? 'Tempeh' : 'Chicken'}.`,
            benefits: "Vitamin B6 and complex carbs help sustain the luteal phase lifespan."
          },
          dinner: {
            meal: "Roasted Roots & Protein Bake",
            ingredients: `${dinnerProtein}, Beetroot, Carrots, Sweet Potato, Brussels sprouts.`,
            benefits: "Fiber prevents estrogen reabsorption, promoting healthy progesterone balance."
          },
          snack: {
            meal: "Cacao Chia Pudding",
            ingredients: "Chia seeds, Cacao powder, Almond milk, Maple syrup, topped with Raspberries.",
            benefits: "Zinc and magnesium support healthy implantation conditions."
          }
        }
      }
    };

    return plans[goal]?.[phase] || plans["Hormone Balance"][phase];
  };

  const currentRecs = getCycleRecs(selectedPhase);
  const currentMealPlan = getCustomMealPlan(dietGoal, selectedPhase, dietType, lactoseFree);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-bold text-gradient">Nutrition & Meal Planner</h2>
        <p className="text-muted text-sm">Fuel your body intelligently. Track calories, hydrate, and align meals with your biological cycle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
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
                {/* Visual Circular ring */}
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

            {/* Add Food form */}
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

            {/* Food logs list */}
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

          {/* Dietary & Supplement Profile */}
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Award className="text-primary" size={22} /> Dietary & Supplement Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Diet Type */}
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <label className="block text-xs font-bold text-muted mb-2 uppercase">Diet Type</label>
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-primary/10">
                  {[
                    { id: 'veg', label: 'Veg' },
                    { id: 'vegan', label: 'Vegan' },
                    { id: 'non-veg', label: 'Non-Veg' }
                  ].map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDietType(d.id)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all-smooth ${dietType === d.id ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-primary'}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lactose Tolerance */}
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <label className="block text-xs font-bold text-muted mb-2 uppercase">Lactose Intake</label>
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-primary/10">
                  {[
                    { id: false, label: 'Standard' },
                    { id: true, label: 'Lactose-Free' }
                  ].map(l => (
                    <button
                      key={l.label}
                      type="button"
                      onClick={() => setLactoseFree(l.id)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all-smooth ${lactoseFree === l.id ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-primary'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supplements */}
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <label className="block text-xs font-bold text-muted mb-2 uppercase">Supplements</label>
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-primary/10">
                  {[
                    { id: false, label: 'None' },
                    { id: true, label: 'Taking' }
                  ].map(s => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setTakingSupplements(s.id)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all-smooth ${takingSupplements === s.id ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-primary'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diet Goal / Plan */}
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <label className="block text-xs font-bold text-muted mb-2 uppercase">Diet Plan Goal</label>
                <select
                  value={dietGoal}
                  onChange={e => setDietGoal(e.target.value)}
                  className="w-full bg-white border border-primary/15 rounded-xl px-2 py-1.5 text-xs text-textMain font-medium cursor-pointer"
                >
                  <option value="Hormone Balance">🌸 Hormone Balance (PCOS/PMS)</option>
                  <option value="Metabolic Reset">⚡ Metabolic Reset</option>
                  <option value="Energy & Strength">🏃‍♀️ Energy & Strength</option>
                  <option value="Fertility Support">🍼 Fertility Support</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cycle Foods sync & Meal Planner */}
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Calendar className="text-primary" size={22} /> Cycle-Synced Meal Planner
              </h3>
              <div className="flex gap-1 bg-primary/5 p-1 rounded-full border border-primary/10">
                {['Menstrual', 'Follicular', 'Ovulation', 'Luteal'].map(ph => (
                  <button 
                    key={ph} 
                    onClick={() => setSelectedPhase(ph)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all-smooth ${selectedPhase === ph ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-primary'}`}
                  >
                    {ph}
                  </button>
                ))}
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex border-b border-primary/10 mb-5">
              <button
                onClick={() => setViewTab('guide')}
                className={`pb-2 px-4 text-xs font-bold border-b-2 transition-all-smooth uppercase tracking-wider ${viewTab === 'guide' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'}`}
              >
                Hormonal Food Guide
              </button>
              <button
                onClick={() => setViewTab('meal-plan')}
                className={`pb-2 px-4 text-xs font-bold border-b-2 transition-all-smooth uppercase tracking-wider ${viewTab === 'meal-plan' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'}`}
              >
                Full Day Custom Meal Plan ({dietGoal})
              </button>
            </div>

            {viewTab === 'guide' ? (
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
                <span className="text-4xl p-2 bg-white rounded-2xl shadow-sm border border-primary/10">
                  {currentRecs.emoji}
                </span>
                <div className="flex-1">
                  <h4 className="font-bold text-primary mb-1">{selectedPhase} Phase Nutrition</h4>
                  <p className="text-xs text-muted mb-4 font-semibold">{currentRecs.slogan}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentRecs.foods.map((food, idx) => (
                      <div key={idx} className="bg-white/90 border border-primary/10 rounded-xl p-3 shadow-inner">
                        <p className="text-sm font-bold text-textMain mb-1">{food.name}</p>
                        <p className="text-xs text-muted font-bold mb-1">Key ingredients: {food.ingredients}</p>
                        <p className="text-xs text-primary leading-snug">{food.reason}</p>
                      </div>
                    ))}
                  </div>

                  {/* Supplement / Natural Nutrients Section */}
                  <div className="mt-5 pt-4 border-t border-primary/10">
                    {takingSupplements ? (
                      <div className="bg-white/80 border border-primary/15 rounded-xl p-4 flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                          <Award size={20} className="animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-secondary uppercase">Recommended Cycle Supplements</p>
                          <p className="text-sm font-semibold text-textMain">{currentRecs.supplements}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/80 border border-primary/15 rounded-xl p-4 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                          <Apple size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-primary uppercase">Natural Nutrient Sources</p>
                          <p className="text-sm font-semibold text-textMain">{currentRecs.naturalNutrients}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-3">
                  <div>
                    <h4 className="font-bold text-primary mb-0.5">{dietGoal} Plan</h4>
                    <p className="text-xs text-muted font-semibold">Tailored for the {selectedPhase} Phase ({dietType === 'non-veg' ? 'Non-Veg' : dietType === 'veg' ? 'Veg' : 'Vegan'})</p>
                  </div>
                  <span className="text-3xl p-1.5 bg-white rounded-xl shadow-sm border border-primary/10">
                    🍱
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Breakfast */}
                  <div className="bg-white/95 border border-primary/10 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] tracking-wider uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full mb-2 inline-block">Breakfast</span>
                      <p className="text-sm font-bold text-textMain mb-1">{currentMealPlan.breakfast.meal}</p>
                      <p className="text-xs text-muted mb-2 font-medium"><strong className="text-textMain">Ingredients:</strong> {currentMealPlan.breakfast.ingredients}</p>
                    </div>
                    <p className="text-xs text-primary bg-primary/5 p-2 rounded-lg leading-snug">{currentMealPlan.breakfast.benefits}</p>
                  </div>

                  {/* Lunch */}
                  <div className="bg-white/95 border border-primary/10 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] tracking-wider uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full mb-2 inline-block">Lunch</span>
                      <p className="text-sm font-bold text-textMain mb-1">{currentMealPlan.lunch.meal}</p>
                      <p className="text-xs text-muted mb-2 font-medium"><strong className="text-textMain">Ingredients:</strong> {currentMealPlan.lunch.ingredients}</p>
                    </div>
                    <p className="text-xs text-primary bg-primary/5 p-2 rounded-lg leading-snug">{currentMealPlan.lunch.benefits}</p>
                  </div>

                  {/* Dinner */}
                  <div className="bg-white/95 border border-primary/10 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] tracking-wider uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full mb-2 inline-block">Dinner</span>
                      <p className="text-sm font-bold text-textMain mb-1">{currentMealPlan.dinner.meal}</p>
                      <p className="text-xs text-muted mb-2 font-medium"><strong className="text-textMain">Ingredients:</strong> {currentMealPlan.dinner.ingredients}</p>
                    </div>
                    <p className="text-xs text-primary bg-primary/5 p-2 rounded-lg leading-snug">{currentMealPlan.dinner.benefits}</p>
                  </div>

                  {/* Snack */}
                  <div className="bg-white/95 border border-primary/10 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] tracking-wider uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full mb-2 inline-block">Snack</span>
                      <p className="text-sm font-bold text-textMain mb-1">{currentMealPlan.snack.meal}</p>
                      <p className="text-xs text-muted mb-2 font-medium"><strong className="text-textMain">Ingredients:</strong> {currentMealPlan.snack.ingredients}</p>
                    </div>
                    <p className="text-xs text-primary bg-primary/5 p-2 rounded-lg leading-snug">{currentMealPlan.snack.benefits}</p>
                  </div>
                </div>

                {/* Supplement / Natural Nutrients Section */}
                <div className="mt-5 pt-4 border-t border-primary/10">
                  {takingSupplements ? (
                    <div className="bg-white/80 border border-primary/15 rounded-xl p-4 flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                        <Award size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-secondary uppercase">Recommended Cycle Supplements</p>
                        <p className="text-sm font-semibold text-textMain">{currentRecs.supplements}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/80 border border-primary/15 rounded-xl p-4 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <Apple size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary uppercase">Natural Nutrient Sources</p>
                        <p className="text-sm font-semibold text-textMain">{currentRecs.naturalNutrients}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                className="bg-gradient-to-t from-secondary to-primary/80 w-full rounded-b-2xl"
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
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold hover:opacity-95 shadow-md transition-all-smooth"
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

      </div>
    </motion.div>
  );
}
