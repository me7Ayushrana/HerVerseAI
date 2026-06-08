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
      { id: '2', category: 'Lunch', name: 'Grilled Chicken Quinoa Salad', kcal: 540 }
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
  const [dietType, setDietType] = useState(() => localStorage.getItem('herverse-diet-type') || 'non-veg');
  const [lactoseFree, setLactoseFree] = useState(() => localStorage.getItem('herverse-lactose-free') === 'true');
  const [takingSupplements, setTakingSupplements] = useState(() => localStorage.getItem('herverse-supplements') === 'true');

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

  const currentRecs = getCycleRecs(selectedPhase);

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
                  placeholder="e.g. Banana, Oats, Chicken"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Diet Type */}
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <label className="block text-xs font-bold text-muted mb-2 uppercase">Diet Type</label>
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-primary/10">
                  {[
                    { id: 'non-veg', label: 'Non-Veg' },
                    { id: 'veg', label: 'Veg' },
                    { id: 'vegan', label: 'Vegan' }
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
            </div>
          </div>

          {/* Cycle Foods sync */}
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Calendar className="text-primary" size={22} /> Cycle-Synced Food Guide
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
