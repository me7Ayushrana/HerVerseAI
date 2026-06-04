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

  const cycleRecs = {
    Menstrual: {
      slogan: "Focus on replenishing iron and zinc lost during bleeding.",
      foods: [
        { name: "Iron Boost Salad", ingredients: "Baby Spinach, Beetroot, Mandarin Oranges, Pumpkin Seeds", reason: "Spinach & seeds supply iron; citrus Vitamin C helps iron absorption." },
        { name: "Seared Salmon & Broccoli", ingredients: "Wild-caught Salmon, Steamed Broccoli, Quinoa", reason: "Healthy fats soothe inflammation; quinoa supplies complex proteins." }
      ],
      emoji: "🍲"
    },
    Follicular: {
      slogan: "Incorporate light, fresh foods that support processing rising estrogen.",
      foods: [
        { name: "Estrogen Balance Bowl", ingredients: "Fermented Kimchi, Kefir dressing, Avocado, Sprouts, Chicken", reason: "Gut-friendly fermented ingredients support estrogen detoxification." },
        { name: "Blossom Green Smoothie", ingredients: "Celery, Green Apples, Flaxseed, Matcha, Almond milk", reason: "Cruciferous nutrients & fiber help flush excess hormonal load." }
      ],
      emoji: "🥗"
    },
    Ovulation: {
      slogan: "High energy phase! Prioritize antioxidant protection.",
      foods: [
        { name: "Vitality Fruit & Nut Plate", ingredients: "Strawberries, Walnuts, Sesame seed glaze, Cottage cheese", reason: "Antioxidants defend ovulatory cells; sesame provides zinc." },
        { name: "Sesame Crusted Tuna", ingredients: "Ahi Tuna, Red Cabbage Slaw, Ginger sesame oil", reason: "Tuna delivers omega-3 fatty acids that optimize follicular release." }
      ],
      emoji: "🍣"
    },
    Luteal: {
      slogan: "Reduce PMS cravings and bloating with magnesium and slow carbs.",
      foods: [
        { name: "Magnesium Stew & Sweet Potato", ingredients: "Roasted Sweet Potato, Kale, Chickpeas, Tahini", reason: "Slow carbs ease cravings; chickpeas provide vitamin B6." },
        { name: "Relax Dark Chocolate Parfait", ingredients: "Greek Yogurt, Chia seeds, 85% Dark Chocolate shavings", reason: "Dark chocolate supplies magnesium to soothe uterine contractions." }
      ],
      emoji: "🥣"
    }
  };

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
                {cycleRecs[selectedPhase].emoji}
              </span>
              <div>
                <h4 className="font-bold text-primary mb-1">{selectedPhase} Phase Nutrition</h4>
                <p className="text-xs text-muted mb-4 font-semibold">{cycleRecs[selectedPhase].slogan}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cycleRecs[selectedPhase].foods.map((food, idx) => (
                    <div key={idx} className="bg-white/90 border border-primary/10 rounded-xl p-3 shadow-inner">
                      <p className="text-sm font-bold text-textMain mb-1">{food.name}</p>
                      <p className="text-xs text-muted font-bold mb-1">Key ingredients: {food.ingredients}</p>
                      <p className="text-xs text-primary leading-snug">{food.reason}</p>
                    </div>
                  ))}
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
